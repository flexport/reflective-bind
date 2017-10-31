// @flow

import React from "react";

(function() {
  return {
    foo() {
      const outerScopeVar = 1;
      const hoistable = arg => {
        // `this` should not be hoisted since we're not accessing any
        // properties on it.
        this;
        // `this.shouldNotHoist` should not be hoisted because we're not
        // accessing any properties on it.
        this.shouldNotHoist;
        // `this.shouldNotHoist.val` should not be hoisted because it is not
        // props or state.
        this.shouldNotHoist.val;

        // eslint-disable-next-line no-unused-vars
        const innerArrow = () => {
          // `this.shouldNotHoist.val` should not be hoisted because it is not
          // props or state.
          this.shouldNotHoist.val;
        };

        // eslint-disable-next-line no-unused-vars
        function inner() {
          // Should not hoist references to `this` properties in nested
          // non-arrow functions.
          this.shouldNotHoist.val;
        }

        // The outerScopeVar and arg are there just to make sure the hoisted
        // argument order is correct.
        return outerScopeVar + arg;
      };

      // Use in JSXExpressionContainer to enable hoisting
      <React.Component onClick={hoistable} />;
    },
    shouldNotHoist: {val: 1},
  };
})();
