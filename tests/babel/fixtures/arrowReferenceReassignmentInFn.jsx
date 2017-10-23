// @flow

import * as React from "react";

(function() {
  let a = 1;

  // Should not hoist because it reassigns a variable in the outer scope.
  const shouldNotHoist = () => {
    // Reassigning a variable `a` in the outerscope means that we cannot hoist.
    a = 10;
    return a;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <div onClick={shouldNotHoist} />;

  return shouldNotHoist();
})();
