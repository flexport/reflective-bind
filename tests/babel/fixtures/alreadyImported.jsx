// @flow

import * as React from "react";

// Make sure import identifier doesn't conflict when transform adds the import.
// The module path should be relative to the plugin-test.js file.
import {babelBind as _testBind} from "../../src";

(function() {
  const hoistable = a => a;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return _testBind(hoistable, null, 1)();
})();
