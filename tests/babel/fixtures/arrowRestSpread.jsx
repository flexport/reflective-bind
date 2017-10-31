// @flow

import * as React from "react";

(function() {
  const hoistable = (a, ...rest) => {
    return b => a + b + rest.reduce((tot, n) => tot + n, 0);
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable(1, 2, 3)(4);
})();
