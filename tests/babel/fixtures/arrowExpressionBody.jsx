// @flow

import * as React from "react";

(function() {
  let a = 1;
  const hoistable = (b, c) => a + b + c;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable(2, 3);
})();
