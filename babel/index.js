/**
 * Replaces uses of Function.prototype.bind with reflective-bind and hoists
 * function expressions and arrow functions when possible to remove function
 * copying.
 *
 * We only do this for code relevant to React render to minimize the
 * processing time and code bloat.
 *
 * Function.prototype.bind:
 *   - Simply replace `expression.bind(...bindArgs)` with
 *     `babelBind(expression, ...bindArgs)`
 *
 * Arrow Functions
 *   - Bail if function closes over any variables that are assigned to after
 *     the fn definition. If we transformed the arrow function in this case,
 *     we would either get a reference error, or we would bind to the wrong
 *     value.
 *   - Bail if the function closes over a variable that is bound after it.
 *     Since we replace the function call with a call to `babelBind` and pass
 *     in the closed over variables, it would result in an reference error.
 *   - Otherwise, hoist the arrow function to module level function and replace
 *     the arrow function with: `babelBind(hoisted, this, ...constants)`,
 *     where `constants` is a list of all the constant variables that the
 *     arrow function closed over (could be empty).
 *
 * Function Expressions:
 *   - There are a lot of edge cases with function expressions, and with the
 *     rise of arrow functions, it is currently not worthwhile to support them.
 *   - The difficulty with function expressions is that the `this` context can
 *     be bound after function definition, but calling `babelBind` requires us
 *     to pick a context to bind to.
 *   - If we want to support them, the best way is via a reflectivePartial
 *     implementation. You would follow the same logic as arrow functions, but
 *     you would hoist and replace with a call to reflectivePartial. Either
 *     that or only support functions that are immediately bound:
 *     `function() {...}.bind(...)`.
 *   - Things to think through more: async and generator functions.
 */

// NOTE: this file written to run directly in node without being transpiled

const logger = require("./utils/logger");

const SKIP_RE = /^\/\/ @no-reflective-bind-babel$/m;

module.exports = function(opts) {
  const t = opts.types;

  let _propRegexCompiled;
  let _filename;
  let _hoistedSlug;
  let _bableBindIdentifer;
  let _babelBindImportDeclaration;

  let _hoistPath;
  let _totalTransformedInAllFiles = 0;

  const rootVisitor = {
    // TODO: figure out how to not do the explicit recursive traversal.
    // Perform an explicit recursive traversal to mitigate the fact that babel
    // runs its plugins in parallel (https://phabricator.babeljs.io/T6730)
    Program(
      path,
      {
        opts: {
          log = "off",
          propRegex = undefined,

          // Hoisted function name prefix
          hoistedSlug = "rbHoisted",
          // Identifier name to assign the imported babelBind to
          babelBindSlug = "rbBabelBind",
          // Location of the main reflective-bind index file
          indexModule = "reflective-bind",
        },
        file,
      }
    ) {
      if (SKIP_RE.test(file.code)) {
        return;
      }
      logger.setLevel(log);
      _propRegexCompiled =
        propRegex != null ? new RegExp(propRegex) : undefined;
      _filename = file.opts.filename;
      _hoistPath = path;
      _hoistedSlug = hoistedSlug;
      _bableBindIdentifer = _hoistPath.scope.generateUidIdentifier(
        babelBindSlug
      );
      _babelBindImportDeclaration = t.importDeclaration(
        [t.importSpecifier(_bableBindIdentifer, t.identifier("babelBind"))],
        t.stringLiteral(indexModule)
      );

      const state = {
        numTransformed: 0,
      };
      path.traverse(visitor, state);

      if (state.numTransformed > 0) {
        addImport();

        _totalTransformedInAllFiles += state.numTransformed;
        logger.debug(
          `Total inline functions transformed: ${_totalTransformedInAllFiles}`
        );
      }
    },
  };

  const visitor = {
    JSXOpeningElement(path) {
      const nameNode = path.node.name;
      if (
        t.isJSXIdentifier(nameNode) &&
        nameNode.name !== "this" &&
        // isCompatTag returns true if the input string is to be transformed to
        // to a string (html literal) in the React.createElement call.
        // https://github.com/babel/babel/blob/04d2c030be2ecbbcdfc664b6ef16ef5f23eb0b20/packages/babel-plugin-transform-react-jsx/src/index.js#L15
        t.react.isCompatTag(nameNode.name)
      ) {
        // No need to transform inline functions on html literals since an html
        // literal cannot be a pure component.
        path.skip();
      }
    },

    JSXAttribute(path) {
      if (
        t.isJSXIdentifier(path.node.name) &&
        shouldSkipProp(path.node.name.name)
      ) {
        path.skip();
      }
    },

    JSXExpressionContainer(path, state) {
      const exprPath = path.get("expression");
      if (t.isIdentifier(exprPath)) {
        const binding = exprPath.scope.getBinding(exprPath.node.name);
        if (!binding) {
          return;
        }
        processPath(binding.path, state);

        // constantViolations are just assignments to the variable after the
        // initial binding. We want to hoist all potential arrow functions that
        // are assigned to the variable.
        for (let i = 0, n = binding.constantViolations.length; i < n; i++) {
          processPath(binding.constantViolations[i], state);
        }
      } else {
        processPath(exprPath, state);
      }
    },
  };

  function shouldSkipProp(name) {
    return (
      name === "ref" || (_propRegexCompiled && !_propRegexCompiled.test(name))
    );
  }

  function processPath(path, state) {
    if (t.isVariableDeclarator(path)) {
      processPath(path.get("init"), state);
    } else if (t.isAssignmentExpression(path)) {
      processPath(path.get("right"), state);
    } else if (t.isConditionalExpression(path)) {
      processPath(path.get("consequent"), state);
      processPath(path.get("alternate"), state);
    } else if (t.isCallExpression(path)) {
      processCallExpression(path, state);
    } else if (t.isArrowFunctionExpression(path)) {
      processArrowFunctionExpression(path, state);
    }
  }

  function processCallExpression(path, rootState) {
    if (
      t.isMemberExpression(path.node.callee) &&
      !path.node.callee.computed &&
      t.isIdentifier(path.node.callee.property, {name: "bind"})
    ) {
      rootState.numTransformed++;
      logger.debug(makeMsg("Transformed call to 'bind'", path));
      path.replaceWith(
        callReflectiveBindExpression(
          path.node.callee.object,
          ...path.node.arguments
        )
      );
    }
  }

  function processArrowFunctionExpression(path, rootState) {
    // Don't hoist if the arrow function is top level (defined in the same
    // scope as the hoist path) since that is where it's going to be hoisted
    // to anyways.
    if (path.parentPath.scope === _hoistPath.scope) {
      logger.debug(
        makeMsg("Skipping arrow function defined in the outermost scope", path)
      );
      return;
    }

    const state = {
      fnPath: path,
      canHoist: true,
      // Set of identifiers that are bound outside of the function.
      outerIdentifierNames: new Set(),
      // List of all member expressions that start with "this.props" or
      // "this.state".
      thisUsagePaths: [],
    };
    path.traverse(arrowFnVisitor, state);
    if (!state.canHoist) {
      return;
    }

    rootState.numTransformed++;
    logger.debug(makeMsg("Transformed arrow function", path));

    // Convert member expressions that start with `this` into arguments and
    // bind them with reflective bind. This makes sure our hoisted function is
    // as pure as possible.
    const [thisUsageArgs, thisUsageNodes] = replacePathsWithUniqueIdentifiers(
      path.scope,
      state.thisUsagePaths
    );

    const hoistedIdentifier = hoist(path.node.body, [
      // outerIdentifiers must come first so we can bind them
      ...makeIdentifiers(state.outerIdentifierNames),
      ...thisUsageArgs,
      ...path.node.params,
    ]);
    path.replaceWith(
      callReflectiveBindExpression(
        hoistedIdentifier,
        t.thisExpression(),
        ...makeIdentifiers(state.outerIdentifierNames),
        ...thisUsageNodes
      )
    );
  }

  const arrowFnVisitor = {
    Identifier(path, state) {
      const hoisted = arrowFnIdentifier(path, state);
      if (hoisted) {
        validateNestedPropertyAccessInArrowFn(path);
      }
    },

    JSXIdentifier(path, state) {
      arrowFnIdentifier(path, state);
    },

    ThisExpression(path, state) {
      // Only allow hoisting if `this` refers to the same `this` as the arrow
      // function we want to hoist.
      if (!isDefinitelySameThisContext(state.fnPath, path)) {
        return;
      }

      // Restrict `this` hoisting to only accesses to `this.(props|state)` and
      // `this.(props|state).value`. We don't support hoisting deep property
      // access (e.g. this.props.value.nested becomes `_temp.nested`).
      const parentPath = path.parentPath;
      if (
        !parentPath ||
        !t.isMemberExpression(parentPath.node) ||
        parentPath.node.object !== path.node
      ) {
        return;
      }
      const parentProperty = parentPath.node.property;
      if (
        !t.isIdentifier(parentProperty) ||
        (parentProperty.name !== "props" && parentProperty.name !== "state")
      ) {
        return;
      }

      const grandparentPath = parentPath.parentPath;

      // If the grandparent is a MemberExpression, hoist that instead.
      const memberExpressionPath =
        grandparentPath &&
        t.isMemberExpression(grandparentPath.node) &&
        grandparentPath.node.object === parentPath.node
          ? grandparentPath
          : parentPath;

      validateNestedPropertyAccessInArrowFn(memberExpressionPath);

      state.thisUsagePaths.push(memberExpressionPath);
    },

    Flow(path) {
      path.skip();
    },
  };

  // Returns true if the identifier needs to be hoisted.
  function arrowFnIdentifier(path, state) {
    // Ideally, we wouldn't need this check, but in babel 6.24.1 path.stop()
    // does not actually stop the entire traversal, only the traversal of the
    // remaining visitor keys of the parent node.
    if (!state.canHoist) {
      path.stop();
      return false;
    }
    const binding = getHoistableBinding(path, state.fnPath.scope);
    if (!binding) {
      return false;
    }
    state.canHoist =
      // Since we have determined that this identifier is bound outside the
      // scope of the function, we must pass this identifier into the hoisted
      // function. This means that we will reference the binding immediately,
      // instead of when the function is called. This will break for cases
      // where the binding actually occurs after the function node.
      // For example:
      //     const test = () => a;
      //     const a = 1;
      // For cases like that above, we cannot hoist the arrow function,
      // otherwise we will get a reference error:
      //     const test = _babelBind(_bbHoisted, this, a); // REFERENCE ERROR!
      //     const a = 1;
      // We must detect this case, and prevent the hoisting from happening.
      isPathDefinitelyBeforeOtherPath(binding.path, state.fnPath) &&
      // For all constantViolations, we have to make sure they also come
      // before the fnPath, otherwise we will bind to the wrong value.
      (binding.constant ||
        binding.constantViolations.every(p => {
          return isPathDefinitelyBeforeOtherPath(p, state.fnPath);
        }));

    if (!state.canHoist) {
      logger.warn(
        makeMsg(
          `Cannot transform arrow function because the variable '${
            path.node.name
          }' is assigned to after the arrow function definition.`,
          path
        )
      );
      // This line unfortunately only stops traversing the visitor keys of the
      // parent node, but ideally here it would stop the entire arrowFnVisitor
      // traversal.
      path.stop();
      return false;
    } else {
      state.outerIdentifierNames.add(path.node.name);
      return true;
    }
  }

  /**
   * Returns the binding iff the identifier is hoistable and the binding occurs
   * outside of the limitScope. Otherwise, return null.
   */
  function getHoistableBinding(identifierPath, limitScope) {
    return shouldHoistIdentifier(identifierPath, limitScope)
      ? identifierPath.scope.getBinding(identifierPath.node.name)
      : null;
  }

  function shouldHoistIdentifier(identifierPath, limitScope) {
    return (
      !isNonComputedNestedProperty(identifierPath) &&
      !hasBindingInScope(identifierPath, limitScope)
    );
  }

  function isNonComputedNestedProperty(identifierPath) {
    const parentNode = identifierPath.parentPath.node;
    return (
      (t.isMemberExpression(parentNode) ||
        t.isJSXMemberExpression(parentNode)) &&
      !parentNode.computed &&
      parentNode.property === identifierPath.node
    );
  }

  /**
   * Returns true iff the identifier is bound within limitScope.
   */
  function hasBindingInScope(identifierPath, limitScope) {
    const name = identifierPath.node.name;
    let scope = identifierPath.scope;
    while (scope) {
      if (scope.hasOwnBinding(name)) {
        return true;
      }
      // This check must come after the hasOwnBinding check because it is ok if
      // the binding occurs in the limitScope.
      if (scope === limitScope) {
        return false;
      }
      scope = scope.parent;
    }
    /* istanbul ignore next */
    throw new Error(
      "identifier has no valid binding and limitScope is not an ancestor scope"
    );
  }

  // Returns true iff we are 100% sure checkPath is executed before otherPath.
  // https://github.com/babel/babel/blob/75808a2d14a5872472eb12ee5135faca4950d57a/packages/babel-traverse/src/path/introspection.js#L216
  function isPathDefinitelyBeforeOtherPath(checkPath, otherPath) {
    const checkPathAncestry = checkPath.getAncestry();
    const otherPathAncestry = otherPath.getAncestry();
    const [checkPathAncestorIdx, otherPathAncestorIdx] = commonAncestorIndices(
      checkPathAncestry,
      otherPathAncestry
    );

    if (checkPathAncestorIdx === 0) {
      // This means that checkPath is a direct ancestor of otherPath. An
      // example of this is a recursive function:
      // const a = () => a();
      // This means checkPath is not executed before the otherPath is executed.
      return false;
    } else if (otherPathAncestorIdx === 0) {
      // This means that checkPath is a direct ancestor of otherPath.
      // In our current use case of this function, this means that the
      // arrow function we want to hoist (otherPath) is a direct ancestor
      // of the declaration / reassignment (checkPath). This means that we are
      // either declaring, or reassigning, an identifier inside the function,
      // which means we can't hoist the arrow function.
      return false;
    }

    /* instanbul ignore if */
    if (checkPathAncestorIdx < 0 || otherPathAncestorIdx <= 0) {
      // This means that there is no common ancestor, which should never happen.
      throw new Error(
        `Invalid ancestor indices [${checkPathAncestorIdx}, ${otherPathAncestorIdx}]`
      );
    }

    // Get the path one level below the common ancestor, to determine which
    // one is executed first.
    const checkPathRelationship = checkPathAncestry[checkPathAncestorIdx - 1];
    const otherPathRelationship = otherPathAncestry[otherPathAncestorIdx - 1];
    /* istanbul ignore if */
    if (!checkPathRelationship || !otherPathRelationship) {
      // This should never happen.
      throw new Error(
        "Invalid checkPathRelationship or otherPathRelationship!"
      );
    }

    // If the checkPath is inside a function, it might be called after
    // otherPath has executed.
    for (let i = 1; i < checkPathAncestorIdx; i++) {
      if (t.isFunction(checkPathAncestry[i])) {
        return false;
      }
    }

    // If both relationshps are part of a container list, the key property
    // gives you the index in the container.
    if (checkPathRelationship.listKey && otherPathRelationship.listKey) {
      /* istanbul ignore if */
      if (checkPathRelationship.container !== otherPathRelationship.container) {
        // This should never happen.
        throw new Error("Relationships not in the same container!");
      }
      // Function declarations can be referenced before they are executed.
      return (
        t.isFunctionDeclaration(checkPath) ||
        checkPathRelationship.key < otherPathRelationship.key
      );
    }

    // Otherwise, use the visitor order to determine which relationship is
    // executed first.
    const commonAncestorType = checkPathAncestry[checkPathAncestorIdx].type;
    const visitorKeys = t.VISITOR_KEYS[commonAncestorType];
    const checkPathPosition = visitorKeys.indexOf(
      checkPathRelationship.listKey || checkPathRelationship.key
    );
    const otherPathPosition = visitorKeys.indexOf(
      otherPathRelationship.listKey || otherPathRelationship.key
    );
    /* istanbul ignore if */
    if (checkPathPosition < 0) {
      throw new Error(`Invalid checkPathRelationship ${checkPathPosition}`);
    }
    /* istanbul ignore if */
    if (otherPathPosition < 0) {
      throw new Error(`Invalid otherPathPosition ${otherPathPosition}`);
    }
    return checkPathPosition < otherPathPosition;
  }

  // Return the indices in the ancestor arrays of where the common ancestor
  // is. If no common ancestor, return [-1, -1].
  function commonAncestorIndices(ancestors1, ancestors2) {
    for (let i = 0, n = ancestors1.length; i < n; i++) {
      const path1 = ancestors1[i];
      const j = ancestors2.findIndex(p => p.node === path1.node);
      if (j >= 0) {
        return [i, j];
      }
    }
    return [-1, -1];
  }

  /**
   * Returns true only if path has the same `this` context as parentPath.
   *
   * This means that the function-ancestor chain must only consist of arrow
   * functions.
   */
  function isDefinitelySameThisContext(parentFnPath, path) {
    let cur = path.getFunctionParent();
    while (cur) {
      if (cur === parentFnPath) {
        return true;
      }
      if (!t.isArrowFunctionExpression(cur.node)) {
        return false;
      }
      cur = cur.getFunctionParent();
    }
    return false;
  }

  function replacePathsWithUniqueIdentifiers(scope, paths) {
    const identifiers = [];
    const nodes = [];
    for (let i = 0, n = paths.length; i < n; i++) {
      const path = paths[i];
      const nodeIdx = nodes.findIndex(n => nodesDefinitelyEqual(n, path.node));
      if (nodeIdx >= 0) {
        path.replaceWith(identifiers[nodeIdx]);
      } else {
        const id = scope.generateUidIdentifier();
        identifiers.push(id);
        nodes.push(path.node);
        // Must replace path after we get the original node from the path.
        path.replaceWith(id);
      }
    }
    return [identifiers, nodes];
  }

  function nodesDefinitelyEqual(node1, node2) {
    /* istanbul ignore else */
    if (node1.type !== node2.type) {
      return false;
    } else if (t.isThisExpression(node1)) {
      return true;
    } else if (t.isIdentifier(node1)) {
      return node1.name === node2.name;
    } else if (t.isStringLiteral(node1)) {
      return node1.value === node2.value;
    } else if (t.isMemberExpression(node1)) {
      return (
        node1.computed === node2.computed &&
        nodesDefinitelyEqual(node1.object, node2.object) &&
        nodesDefinitelyEqual(node1.property, node2.property)
      );
    } else {
      throw new Error(
        `Equality comparison not supported for node type "${node1.type}"`
      );
    }
  }

  function makeIdentifiers(names) {
    const identifiers = [];
    names.forEach(n => identifiers.push(t.identifier(n)));
    return identifiers;
  }

  function hoist(body, params) {
    const identifier = _hoistPath.scope.generateUidIdentifier(_hoistedSlug);
    const hoistedFn = t.functionDeclaration(
      identifier,
      params,
      ensureBlockBody(body)
    );
    addToHoistPath(hoistedFn);
    return identifier;
  }

  function ensureBlockBody(body) {
    return t.isBlockStatement(body)
      ? body
      : // A non-block body for arrow function implies that the expression value
        // is returned.
        t.blockStatement([t.returnStatement(body)]);
  }

  function callReflectiveBindExpression(...args) {
    return t.callExpression(_bableBindIdentifer, args);
  }

  function addImport() {
    addToHoistPath(_babelBindImportDeclaration);
  }

  function addToHoistPath(node) {
    /* istanbul ignore else */
    if (_hoistPath.node.body && _hoistPath.node.body.length) {
      node.leadingComments = _hoistPath.node.body[0].leadingComments;
      _hoistPath.node.body[0].leadingComments = undefined;
    }
    _hoistPath.unshiftContainer("body", node);
  }

  /**
   * TODO: move this blob of text out to the docs and link to it.
   *
   * Checks if the path is part of a nested property access.
   * This means that it is of the form `pathNode.foo`.
   *
   * We want to encourage developers to manually hoist these nested propery
   * accesses out to constant variables to reduce wasted re-renders because
   * we only extract the leftmost object as the argument to the hoisted
   * function.
   *
   * For example:
   *   const obj = {...};
   *   const handleClick = () => this.setState({foo: obj.a.b.c});
   *
   * Is transformed to:
   *   function _hoisted(obj) {
   *     this.setState(foo: obj.a.b.c);
   *   }
   *   ...
   *   const obj = {...};
   *   const handleClick = babelBind(_hoisted, this, obj);
   *
   * In this case, the handleClick function will not be reflectively equal
   * whenever the `obj` references changes. It is better for the user to
   * extract the value out to a constant:
   *   const obj = {...};
   *   const c = obj.a.b.c;
   *   const handleClick = () => this.setState({foo: c});
   *
   * This is transformed to:
   *   function _hoisted(c) {
   *     this.setState(foo: c);
   *   }
   *   ...
   *   const obj = {...};
   *   const c = obj.a.b.c;
   *   const handleClick = babelBind(_hoisted, this, c);
   *
   * Which will be reflectively equal as long as c doesn't change value, even
   * if the `obj` reference changes.
   *
   * Note that `pathNode.foo()` is ok because pulling `pathNode.foo` out and
   * calling `foo()` on its own does not result in the right context within
   * the function.
   */
  function validateNestedPropertyAccessInArrowFn(path) {
    if (
      path &&
      path.parentPath &&
      t.isMemberExpression(path.parentPath.node) &&
      path.parentPath.parentPath &&
      !t.isCallExpression(path.parentPath.parentPath.node)
    ) {
      const nodeStr = nodeToString(path.parentPath.node);
      logger.info(
        makeMsg(
          `Accessing nested property '${nodeStr}'. Consider pulling the nested property value out to a constant and closing over the constant.`,
          path
        )
      );
    }
  }

  function nodeToString(node) {
    if (!node) {
      return;
    }
    if (t.isNullLiteral(node)) {
      // Must come before isLiteral
      return "null";
    } else if (t.isLiteral(node)) {
      return node.extra.raw;
    } else if (t.isIdentifier(node)) {
      return node.name;
    } else if (t.isThisExpression(node)) {
      return "this";
    } else if (t.isMemberExpression(node)) {
      const objectStr = nodeToString(node.object);
      const propertyStr = nodeToString(node.property);
      return node.computed
        ? `${objectStr}[${propertyStr}]`
        : `${objectStr}.${propertyStr}`;
    } else if (t.isCallExpression(node)) {
      const argsStr = node.arguments.map(nodeToString).join(", ");
      return `${nodeToString(node.callee)}(${argsStr})`;
    }
    return `__${node.type}__`;
  }

  function makeMsg(msg, path) {
    const start = path.node.loc.start;
    return `${msg} (${_filename} ${start.line}:${start.column})`;
  }

  return {visitor: rootVisitor};
};
