// @flow

import * as React from "react";

(function() {
  const c = 1;
  let a = 1;

  // Should not hoist because it references a variable that is assigned after.
  const shouldNotHoist = () => {
    // Reference the non-constant identifier first.
    alert(a);
    // Reference a constant identifier next.
    // Make sure we don't hoist even if we reference a constant.
    alert(c);
    return a;
  };

  a = 10;

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={shouldNotHoist} />;

  return shouldNotHoist();
})();
