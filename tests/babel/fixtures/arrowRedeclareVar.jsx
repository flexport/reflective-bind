// @flow

import * as React from "react";

(function() {
  // eslint-disable-next-line no-unused-vars
  let a = 1;

  // Should not add `a` as a parameter to the hoisted function.
  const hoistable = () => {
    let a = 2;
    return a;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable();
})();
