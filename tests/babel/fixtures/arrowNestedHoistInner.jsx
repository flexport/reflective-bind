// @flow

import * as React from "react";

(function() {
  let nonConst = 1;

  const notHoistable = items => {
    // Refer to `nonConst` to prevent hoisting of outer function.
    nonConst;

    return items.map(item => {
      const hoistable = () => item;
      // Use in JSXExpressionContainer to enable hoisting
      return <div onClick={hoistable} />;
    });
  };

  nonConst = 2;

  <PureChild render={notHoistable} />;
})();
