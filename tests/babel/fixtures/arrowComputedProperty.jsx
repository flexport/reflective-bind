// @flow

import * as React from "react";

(function() {
  // These dummy variables exist to make sure we don't use the wrong variables
  // when hoisting.
  // eslint-disable-next-line no-unused-vars
  let a = 1;
  // eslint-disable-next-line no-unused-vars
  let b = 2;

  let prop = "a";

  const hoistable = obj => {
    return obj[prop].b;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;

  return hoistable({a: {b: 10}});
})();
