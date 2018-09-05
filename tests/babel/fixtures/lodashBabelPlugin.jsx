// @flow

import * as React from "react";
import {intersection} from "lodash";

(function() {
  let a = 1;

  // After hoisting, the hoisted function should be called with the transformed
  // lodash import (i.e. `_intersection`)
  const hoistable = (c, d) => {
    // After hoisting, this should reference the `intersection` function param
    intersection([], []);
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;
})();
