// @flow

import * as React from "react";

(function() {
  const shouldNotHoist = () => a;
  const a = 2;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={shouldNotHoist} />;

  return shouldNotHoist();
})();
