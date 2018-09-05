// @flow

import {transformFileSync} from "babel-core";
import fs from "fs";
import path from "path";
import plugin from "../../babel";
import logger from "../../babel/utils/logger";

jest.mock("../../babel/utils/logger");

// Hoisted function name prefix
const HOISTED_SLUG = "testBBHoisted";
// Identifier name to assign the imported babelBind to
const BABEL_BIND_IDENTIFIER_NAME = "testBind";
// Location of the main reflective-bind index file
const INDEX_MODULE = "../../src";

const PLUGIN_OPTS = {
  log: "debug",
  hoistedSlug: HOISTED_SLUG,
  babelBindSlug: BABEL_BIND_IDENTIFIER_NAME,
  indexModule: INDEX_MODULE,
};

const TARGET_PLUGIN = [plugin, PLUGIN_OPTS];

const SNAPSHOT_TRANSFORM_OPTS = {
  babelrc: false,
  parserOpts: {
    plugins: ["flow", "jsx"],
  },
  plugins: [TARGET_PLUGIN, "lodash"],
};

const VALIDATE_TRANSFORM_OPTS = {
  babelrc: false,
  presets: ["env", "react", "stage-2"],
  plugins: [TARGET_PLUGIN, "transform-flow-comments"],
};

const NESTED_PROPERTY_RE = /^Accessing nested property.*/;

describe("reflective-bind babel transform", () => {
  beforeEach(() => {
    logger.debug.mockClear();
    logger.info.mockClear();
    logger.warn.mockClear();
  });

  const fixturesDir = path.join(__dirname, "fixtures");
  fs.readdirSync(fixturesDir).forEach(filename => {
    it(filename, () => {
      const filePath = path.join(fixturesDir, filename);

      // Run the snapshot assertion first so we know what the transformed code
      // looks like even if later assertions fail.
      const {code: snapshotCode} = transformFileSync(
        filePath,
        CUSTOM_SNAPSHOT_OPTS[filename] || SNAPSHOT_TRANSFORM_OPTS
      );
      expect(snapshotCode).toMatchSnapshot();

      validateNestedPropertyLogs(filename);

      const {code: validationCode} = transformFileSync(
        filePath,
        VALIDATE_TRANSFORM_OPTS
      );
      validateResult(filename, validationCode);
    });
  });
});

const NESTED_PROPERTY_COUNTS = {
  "arrowComputedProperty.jsx": 1,
  "arrowStatelessComponentProps.jsx": 1,
  "arrowThisCallExpression.jsx": 1,
  "arrowThisProps.jsx": 1,
  "arrowThisState.jsx": 1,
};

function validateNestedPropertyLogs(filename) {
  const logCalls = logger.info.mock.calls.filter(c =>
    NESTED_PROPERTY_RE.test(c[0])
  );
  expect(logCalls.length).toBe(NESTED_PROPERTY_COUNTS[filename] || 0);
}

// To not expect a result from a test case, explicitly set the value to
// 'undefined'. This is to make sure that a typo in a filename won't lead to no
// assertions being run, and thus not testing what was inteded to be tested.
const EVAL_RESULTS = {
  "alreadyImported.jsx": 1,
  "alreadyRequired.jsx": 1,
  "arrowBind.jsx": 6,
  "arrowComputedProperty.jsx": 10,
  "arrowContext.jsx": 1,
  "arrowDeclareFnAfterFn.jsx": undefined,
  "arrowDeclareVarAfterFn.jsx": 2,
  "arrowExpressionBody.jsx": 6,
  "arrowInlineJsxContainerElement.jsx": undefined,
  "arrowJsxIdentifier.jsx": undefined,
  "arrowJsxMemberExpression.jsx": undefined,
  "arrowMemberExpression.jsx": 10,
  "arrowNested.jsx": 10,
  "arrowNestedHoistDeep.jsx": undefined,
  "arrowNestedHoistInner.jsx": undefined,
  "arrowReferenceLateAssignment.jsx": 10,
  "arrowReferenceLateAssignmentDifferentScope.jsx": 10,
  "arrowReferenceOkAssignment.jsx": 10,
  "arrowReferenceOkAssignmentDifferentScope.jsx": 10,
  "arrowReferenceReassignmentInFn.jsx": 10,
  "arrowReferenceReassignmentInOtherArrowFn.jsx": 1,
  "arrowReferenceReassignmentInOtherFn.jsx": 1,
  "arrowRedeclareVar.jsx": 2,
  "arrowRedeclareVarAfterFn.jsx": 2,
  "arrowRestSpread.jsx": 10,
  "arrowSimple.jsx": 10,
  "arrowStatelessComponentProps.jsx": undefined,
  "arrowThis.jsx": undefined,
  "arrowThisCallExpression.jsx": undefined,
  "arrowThisProps.jsx": undefined,
  "arrowThisState.jsx": undefined,
  "arrowTopLevel.jsx": undefined,
  "arrowWithFlow.jsx": 10,
  "bindComputed.jsx": undefined,
  "bindFlow.jsx": 3,
  "bindInlineJsxContainerElement.jsx": undefined,
  "bindNonFunction.jsx": 99,
  "bindSimple.jsx": 3,
  "bindingNodeLocNPE.jsx": undefined,
  "classReference.jsx": undefined,
  "duplicateComputedMemberExpressionStringArg.jsx": undefined,
  "flowGenerics.jsx": 6,
  "flowObjMap.jsx": undefined,
  "fnAsync.jsx": undefined,
  "fnGenerator.jsx": undefined,
  "fnComputedProperty.jsx": 10,
  "fnContext.jsx": 10,
  "fnJsxIdentifier.jsx": undefined,
  "fnJsxMemberExpression.jsx": undefined,
  "fnMemberExpression.jsx": 10,
  "fnOuterVar.jsx": 6,
  "fnRedeclareVar.jsx": 2,
  "fnSimple.jsx": 4,
  "fnTopLevel.jsx": undefined,
  "fnWithFlow.jsx": 4,
  "ignorePropNameByRegex.jsx": undefined,
  "jsxHtmlLiteral.jsx": undefined,
  "mapArrow.jsx": undefined,
  "noTransform.jsx": undefined,
  "reassignIdentifier.jsx": undefined,
  "recursive.jsx": undefined,
  "refCallback.jsx": undefined,
  "renameIdentifier.jsx": undefined,
  "ternaryExpression.jsx": undefined,
  "ternaryExpressionInline.jsx": undefined,
};

const CUSTOM_SNAPSHOT_OPTS = {
  "ignorePropNameByRegex.jsx": {
    ...SNAPSHOT_TRANSFORM_OPTS,
    plugins: [
      [
        plugin,
        {
          ...PLUGIN_OPTS,
          propRegex: "^on[A-Z].*$",
        },
      ],
    ],
  },
};

function validateResult(filename: string, code: string) {
  expect(EVAL_RESULTS.hasOwnProperty(filename)).toBe(true);
  const expectedEvalResult = EVAL_RESULTS[filename];
  if (expectedEvalResult !== undefined) {
    // eslint-disable-next-line no-eval
    expect(eval(code)).toEqual(expectedEvalResult);
  }
}
