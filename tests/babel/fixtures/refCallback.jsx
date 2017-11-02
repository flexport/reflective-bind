// @flow

import * as React from "react";

(function() {
  // Should not hoist callbacks attached to the `ref` prop.
  const shouldNotHoist = e => {};

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component ref={shouldNotHoist} />;
})();
