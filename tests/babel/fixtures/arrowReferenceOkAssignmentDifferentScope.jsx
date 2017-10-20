// @flow

import * as React from "react";

(function() {
  let a = 1;
  if (a < 5) {
    // Reassignment in different scope should be ok as long as it is before the
    // arrow function.
    a = 10;
  }

  // Hoistable because the reassignment happens before the function definition.
  const hoistable = () => {
    return a;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <div onClick={hoistable} />;

  return hoistable();
})();
