// @flow

import * as React from "react";

(function() {
  const test = {
    bind(...args: any) {
      return 99;
    },
  };

  // This will still transformed to a babelBind call, and babelBall will have the
  // logic to not convert this call to reflective-bind.
  const bindable = test.bind(null);

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={bindable} />;

  return bindable;
})();
