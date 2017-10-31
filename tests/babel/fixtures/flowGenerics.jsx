// @flow

import * as React from "react";

(function() {
  const hoistMeWithoutFlowIdentifiers = () => {
    let arr: Array<number> = [1, 2, 3];
    return arr.reduce((sum, next) => sum + next, 0);
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistMeWithoutFlowIdentifiers} />;

  return hoistMeWithoutFlowIdentifiers();
})();
