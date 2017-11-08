// @flow

import React from "react";

(function() {
  function test(a, b) {
    return a + b;
  }

  const bind = "bind";
  // Should not transform because `test[bind]` is a computed MemberExpression
  const shouldNotTransform = test[bind](null, 1, 2);

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={shouldNotTransform} />;
})();
