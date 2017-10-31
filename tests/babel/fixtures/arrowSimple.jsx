// @flow

import * as React from "react";

(function() {
  let a = 1;

  const hoistable = (c, d) => {
    let b = 2;
    return a + b + c + d;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable(3, 4);
})();
