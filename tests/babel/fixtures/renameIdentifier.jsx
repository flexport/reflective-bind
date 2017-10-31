// @flow

/**
 * We were sharing the same identifier object for the argument in the call to
 * the hoisted function and the hoisted function parameter. This caused an
 * issue where if the identifier is renamed at the call site, the function
 * parameter is also renamed.
 */

import * as React from "react";

(function() {
  // eslint-disable-next-line no-unused-vars
  function foo() {
    switch ("a") {
      case "b": {
        // eslint-disable-next-line no-unused-vars
        const w = 1;
        break;
      }
      case "c": {
        // 'w' will be renamed to '_w' by another babel transform.
        const w = 2;
        const hoistable = () => w;

        // Use in JSXExpressionContainer to enable hoisting
        <React.Component onClick={hoistable} />;

        break;
      }
    }
  }
})();
