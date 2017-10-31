// @flow

import * as React from "react";

(function() {
  // eslint-disable-next-line no-unused-vars
  let a = 1;
  // eslint-disable-next-line no-unused-vars
  let b = 2;
  let prop = "b";

  const hoistable = obj => {
    return obj.a[prop];
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable({a: {b: 10}});
})();
