// @flow

import * as React from "react";

function foo() {}

(function() {
  const condition = true;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={condition ? foo.bind(null) : () => 1} />;
})();
