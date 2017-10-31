// @flow

import * as React from "react";

function foo() {}

(function() {
  const condition = true;
  const fn = condition ? foo.bind(null) : () => 1;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={fn} />;
})();
