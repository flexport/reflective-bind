// @flow

import * as React from "react";

// Regression test.
// Referencing a class was causing the "binding's scope must be equal to or is
// an ancestor of the path's scope" error to trigger.

(function() {
  class Foo {}

  const hoistable = () => Foo;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;
})();
