// @flow

import * as React from "react";

(function() {
  let a = 1;

  // This function is used as a callback to the `render` prop.
  // The index-test.js should be configured to only allow
  // `on[A-Z][A-Za-z]+` prop names.
  const shouldNotHoist = () => a;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component render={shouldNotHoist} />;

  // This function should still be hoisted because it is used
  // as a callback to the `onClick` prop.
  const hoistable = () => a;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;
})();
