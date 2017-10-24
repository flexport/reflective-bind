// @flow

import * as React from "react";

(function() {
  let a = 1;

  const hoistable = b => {
    let c = 3;
    const nestedHoistable = d => a + b + c + d;
    return <div onClick={nestedHoistable} />;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <div onClick={hoistable} />;
})();
