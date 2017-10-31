// @flow

import * as React from "react";

(function() {
  let a = 1;

  type C = number;
  type D = number;

  const hoistable = (c: C, d: D) => {
    let b = 2;
    return a + b + c + d;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable(3, 4);
})();
