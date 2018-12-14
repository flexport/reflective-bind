// @flow

import * as React from "react";

(function() {
  const shouldNotHoist = (a, b) => {
    return a + b;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component>{shouldNotHoist}</React.Component>;
})();
