// @flow

import * as React from "react";

(function() {
  let a = 1;
  a = 10;

  // Hoistable because the reassignment happens before the function definition.
  const hoistable = () => {
    return a;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable();
})();
