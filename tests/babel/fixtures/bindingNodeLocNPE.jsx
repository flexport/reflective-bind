// @flow

/**
 * We were getting a NPE when trying to access a binding's node location.
 * This is caused when a hoisted function contains an unhoistable function, and
 * we traverse the hoisted function with our visitor. The hoisted function's
 * parameters (that are created as a result of referencing variables out of the
 * function's scope) do not have a location, which causes the NPE. This was
 * fixed by determining the execution order of code without looking at the
 * code's source location and using the AST instead.
 */

import * as React from "react";

(function() {
  // eslint-disable-next-line no-unused-vars
  function wrapper() {
    const a = 1;

    const hoistable = () => {
      let nonConst = 3;
      nonConst = 10;
      // eslint-disable-next-line no-unused-vars
      const notHoistable = () => a + nonConst;
    };

    // Use in JSXExpressionContainer to enable hoisting
    <React.Component onClick={hoistable} />;
  }
})();
