/* eslint-disable flowtype/require-valid-file-annotation */
/* eslint-disable flowtype/require-parameter-type */

import React from "react";

(function() {
  function test(a, b) {
    return a + b;
  }

  const bindable = test.bind(null, 1, 2);

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={bindable} />;

  return bindable();
})();
