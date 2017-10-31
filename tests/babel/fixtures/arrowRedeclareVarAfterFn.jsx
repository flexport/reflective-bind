// @flow

import * as React from "react";

(function() {
  // eslint-disable-next-line no-unused-vars
  const a = 1;

  function outer() {
    // If hoisted, internal `a` will have the wrong value
    const shouldNotHoist = () => a;
    const a = 2;

    // Use in JSXExpressionContainer to enable hoisting
    <React.Component onClick={shouldNotHoist} />;

    return shouldNotHoist();
  }

  return outer();
})();
