// @flow

import React from "react";

(function() {
  return {
    foo() {
      const hoistable = () => {
        // The function body should remain the same after hoisting since we
        // don't special case references to `this`
        this;
        this.shouldNotChange;
        this.shouldNotChange.val;
        this.shouldNotChange.fn();
      };

      // Use in JSXExpressionContainer to enable hoisting
      <React.Component onClick={hoistable} />;
    },
    shouldNotChange: {
      val: 1,
      fn: () => {},
    },
  };
})();
