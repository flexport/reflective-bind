// @flow

/**
 * reflectiveBind is an augmented version of Function.prototype.bind that
 * remembers the function and arguments that it was called with so that it is
 * possible to perform equality comparison on the bound functions.
 *
 * In React, it is recommended to not bind in render because it prevents you
 * from optimizing your components with PureComponents.
 *   - https://ryanfunduk.com/articles/never-bind-in-render
 *   - https://flexport.engineering/optimizing-react-rendering-part-1-9634469dca02
 *
 * reflectiveBind and reflectiveEqual allows you to implement
 * shouldComponentUpdate such that it can still detect when two bound functions
 * are equal, which prevents the component from wastefully re-rendering.
 *
 * Note that reflectiveBind will still create a new functions instance on each
 * call.
 *
 * ============================================================================
 * React Example
 * ============================================================================
 *   import React from 'react';
 *   import bind from 'reflective-bind';
 *
 *   class ParentComponent extends React.Component {
 *     render() {
 *       const views = this.props.values.map((value, i) =>
 *         <PureChild
 *           onChange={bind(this.handleIndexedChange, this, i)}
 *           value={value}
 *         />
 *       );
 *       ...
 *     }
 *
 *     handleIndexedChange = (i, change) => {...};
 *   }
 *
 *   The PureChild component can then use reflectiveEqual in the
 *   shouldComponentUpdate to do the equality comparison on the onChange
 *   handler.
 */

// ============================================================================
// The types below allow reflectiveBind to be called with up to 4 arguments, if
// more are needed, new types will need to be added.
// ============================================================================

/* eslint-disable no-redeclare */

// Function with 0 args
declare function reflectiveBind<A>(f: () => A, ctx: mixed): () => A;

// Function with 1 arg
declare function reflectiveBind<A, B>(f: (A) => B, ctx: mixed): A => B;

declare function reflectiveBind<A, B>(f: (A) => B, ctx: mixed, a: A): () => B;

// Function with 2 arg
declare function reflectiveBind<A, B, C>(
  f: (A, B) => C,
  ctx: mixed
): (A, B) => C;

declare function reflectiveBind<A, B, C>(
  f: (A, B) => C,
  ctx: mixed,
  a: A
): B => C;

declare function reflectiveBind<A, B, C>(
  f: (A, B) => C,
  ctx: mixed,
  a: A,
  b: B
): () => C;

// Function with 3 args
declare function reflectiveBind<A, B, C, D>(
  f: (A, B, C) => D,
  ctx: mixed
): (A, B, C) => D;

declare function reflectiveBind<A, B, C, D>(
  f: (A, B, C) => D,
  ctx: mixed,
  a: A
): (B, C) => D;

declare function reflectiveBind<A, B, C, D>(
  f: (A, B, C) => D,
  ctx: mixed,
  a: A,
  b: B
): C => D;

declare function reflectiveBind<A, B, C, D>(
  f: (A, B, C) => D,
  ctx: mixed,
  a: A,
  b: B,
  c: C
): () => D;

// Function with 4 args
declare function reflectiveBind<A, B, C, D, E>(
  f: (A, B, C, D) => E,
  ctx: mixed
): (A, B, C, D) => E;

declare function reflectiveBind<A, B, C, D, E>(
  f: (A, B, C, D) => E,
  ctx: mixed,
  a: A
): (B, C, D) => E;

declare function reflectiveBind<A, B, C, D, E>(
  f: (A, B, C, D) => E,
  ctx: mixed,
  a: A,
  b: B
): (C, D) => E;

declare function reflectiveBind<A, B, C, D, E>(
  f: (A, B, C, D) => E,
  ctx: mixed,
  a: A,
  b: B,
  c: C
): D => E;

declare function reflectiveBind<A, B, C, D, E>(
  f: (A, B, C, D) => E,
  ctx: mixed,
  a: A,
  b: B,
  c: C,
  d: D
): () => E;

// eslint-disable-next-line flowtype/require-parameter-type
export default function reflectiveBind(f, ctx, ...args) {
  const result = f.bind(ctx, ...args);
  if (result === f) {
    // This happens when reflectiveBind is called with a function that is
    // an auto-bounded method of React.createClass. We simply punt on this.
    return result;
  }
  Object.defineProperty(result, "__func", {value: f});
  Object.defineProperty(result, "__ctx", {value: ctx});
  Object.defineProperty(result, "__args", {value: args});
  return result;
}

/* eslint-enable no-redeclare */

/**
 * Returns true iff both functions are bound with reflectiveBind, the original
 * functions are equal, and the bound arguments are shallowly equal.
 */
export function reflectiveEqual(f: mixed, g: mixed) {
  const rf = toReflective(f);
  const rg = toReflective(g);
  if (rf != null && rg != null) {
    return (
      rf.__ctx === rg.__ctx &&
      arrayShallowReflectiveEq(rf.__args, rg.__args) &&
      (rf.__func === rg.__func || reflectiveEqual(rf.__func, rg.__func))
    );
  } else {
    return false;
  }
}

export function isReflective(f: mixed) {
  return toReflective(f) != null;
}

type Reflective = {
  __func: () => {},
  __ctx: mixed,
  __args: Array<mixed>,
};

// To make flow happy
function toReflective(f: mixed): ?Reflective {
  if (
    typeof f === "function" &&
    typeof f.__func === "function" &&
    f.hasOwnProperty("__ctx") &&
    Array.isArray(f.__args)
  ) {
    return f;
  } else {
    return null;
  }
}

function arrayShallowReflectiveEq(a: Array<mixed>, b: Array<mixed>) {
  if (a === b) {
    return true;
  }
  if (a.length === b.length) {
    for (let i = 0, n = a.length; i < n; i++) {
      if (a[i] !== b[i] && !reflectiveEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}
