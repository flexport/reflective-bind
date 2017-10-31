// @flow

import * as React from "react";

(function() {
  function foo() {}

  // Inline bind in JSXExpressionContainer should be converted.
  <React.Component onClick={foo.bind(this)} />;
})();
