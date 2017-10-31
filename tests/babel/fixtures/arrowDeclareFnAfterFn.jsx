// @flow

import * as React from "react";

(function() {
  // Function delcarations can be referenced even if declared after.
  // eslint-disable-next-line no-unused-vars
  const hoistable = () => fn;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  function fn() {}
})();
