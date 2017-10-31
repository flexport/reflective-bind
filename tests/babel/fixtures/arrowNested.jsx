// @flow

import * as React from "react";

(function() {
  let a = 1;

  const hoistable = b => {
    let c = 3;
    // Should not hoist this returned arrow fn because it is not used in a
    // JSXExpressionContainer.
    return d => a + b + c + d;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable(2)(4);
})();
