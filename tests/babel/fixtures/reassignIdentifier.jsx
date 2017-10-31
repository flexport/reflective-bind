// @flow

import * as React from "react";

function foo() {}

(function() {
  let fn;

  fn = () => 1;
  fn = foo.bind(null);

  let a = 1;
  a = 2;
  fn = () => a;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={fn} />;
})();
