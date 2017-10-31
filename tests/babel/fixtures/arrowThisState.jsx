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
        // `this.state` should be hoisted
        this.state;
        // `this.state.val` should be hoisted.
        this.state.val;
        // `this.state.nested.val` should only hoist `this.state.nested`
        this.state.nested.val;

        // eslint-disable-next-line no-unused-vars
        const innerArrow = () => {
          // Should still hoist if the nested function is an arrow function.
          this.state.val;

          // eslint-disable-next-line no-unused-vars
          const innerInnerArrow = () => {
            // Should still hoist since this arrow function is within a nested
            // arrow function.
            this.state.val;
          };
        };

        // eslint-disable-next-line no-unused-vars
        function inner() {
          // Should NOT hoist references to `this` properties in nested
          // non-arrow functions.
          this.state.val;

          // eslint-disable-next-line no-unused-vars
          const innerInnerArrow = () => {
            // Should NOT since this arrow function is within a nested
            // non-arrow function.
            this.state.val;
          };
        }

        // The outerScopeVar and arg are there just to make sure the hoisted
        // argument order is correct.
        return outerScopeVar + arg;
      };

      // Use in JSXExpressionContainer to enable hoisting
      <React.Component onClick={hoistable} />;
    },
    state: {
      val: 1,
      nested: {val: 1},
    },
  };
})();
