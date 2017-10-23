// @flow

import {transformFileSync} from "babel-core";
import fs from "fs";
import path from "path";
import plugin from "../../babel";

// Hoisted function name prefix
const HOISTED_SLUG = "testBBHoisted";
// Identifier name to assign the imported babelBind to
const BABEL_BIND_IDENTIFIER_NAME = "testBind";
// Location of the main reflective-bind index file
const INDEX_MODULE = "../../src";

const TARGET_PLUGIN = [
  plugin,
  {
    hoistedSlug: HOISTED_SLUG,
    babelBindSlug: BABEL_BIND_IDENTIFIER_NAME,
    indexModule: INDEX_MODULE,
  },
];

const SNAPSHOT_TRANSFORM_OPTS = {
  babelrc: false,
  parserOpts: {
    plugins: ["flow", "jsx"],
  },
  plugins: [TARGET_PLUGIN],
};

const VALIDATE_TRANSFORM_OPTS = {
  babelrc: false,
  presets: ["env", "react", "stage-2"],
  plugins: [TARGET_PLUGIN, "transform-flow-comments"],
};

describe("reflective-bind babel transform", () => {
  const fixturesDir = path.join(__dirname, "fixtures");
  fs.readdirSync(fixturesDir).forEach(filename => {
    it(filename, () => {
      const filePath = path.join(fixturesDir, filename);

      // Run the snapshot assertion first so we know what the transformed code
      // looks like even if later assertions fail.
      const {code: snapshotCode} = transformFileSync(
        filePath,
        SNAPSHOT_TRANSFORM_OPTS
      );
      expect(snapshotCode).toMatchSnapshot();

      const {code: validationCode} = transformFileSync(
        filePath,
        VALIDATE_TRANSFORM_OPTS
      );
      validateResult(filename, validationCode);
    });
  });
});

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
  "arrowReferenceLateAssignment.jsx": 10,
  "arrowReferenceLateAssignmentDifferentScope.jsx": 10,
  "arrowReferenceOkAssignment.jsx": 10,
  "arrowReferenceOkAssignmentDifferentScope.jsx": 10,
  "arrowReferenceReassignmentInFn.jsx": 10,
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
  "bindFlow.jsx": 3,
  "bindInlineJsxContainerElement.jsx": undefined,
  "bindNonFunction.jsx": 99,
  "bindSimple.jsx": 3,
  "bindingNodeLocNPE.jsx": undefined,
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
  "mapArrow.jsx": undefined,
  "noTransform.jsx": undefined,
  "reassignIdentifier.jsx": undefined,
  "recursive.jsx": undefined,
  "renameIdentifier.jsx": undefined,
  "ternaryExpression.jsx": undefined,
  "ternaryExpressionInline.jsx": undefined,
};

function validateResult(filename: string, code: string) {
  expect(EVAL_RESULTS.hasOwnProperty(filename)).toBe(true);
  const expectedEvalResult = EVAL_RESULTS[filename];
  if (expectedEvalResult !== undefined) {
    // eslint-disable-next-line no-eval
    expect(eval(code)).toEqual(expectedEvalResult);
  }
}
