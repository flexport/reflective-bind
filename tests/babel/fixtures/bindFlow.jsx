// @flow

import * as React from "react";

(function() {
  type A = number;

  function test(a: A, b: number) {
    return a + b;
  }

  const bindable = test.bind(null, 1, 2);

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={bindable} />;

  return bindable();
})();
