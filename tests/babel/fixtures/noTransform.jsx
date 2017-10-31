// @flow
// @no-reflective-bind-babel

import * as React from "react";

(function() {
  // Should not be hoisted because of the @no-reflective-bind-babel above.
  const shouldNotHoist = () => {};

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={shouldNotHoist} />;
})();
