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
        // `this.props` should be hoisted
        this.props;
        // `this.props.val` should be hoisted.
        this.props.val;
        // `this.props.nested.val` should only hoist `this.props.nested`
        this.props.nested.val;

        // eslint-disable-next-line no-unused-vars
        const innerArrow = () => {
          // Should still hoist if the nested function is an arrow function.
          this.props.val;

          // eslint-disable-next-line no-unused-vars
          const innerInnerArrow = () => {
            // Should still hoist since this arrow function is within a nested
            // arrow function.
            this.props.val;
          };
        };

        // eslint-disable-next-line no-unused-vars
        function inner() {
          // Should NOT hoist references to `this` properties in nested
          // non-arrow functions.
          this.props.val;

          // eslint-disable-next-line no-unused-vars
          const innerInnerArrow = () => {
            // Should NOT since this arrow function is within a nested
            // non-arrow function.
            this.props.val;
          };
        }

        // The outerScopeVar and arg are there just to make sure the hoisted
        // argument order is correct.
        return outerScopeVar + arg;
      };

      // Use in JSXExpressionContainer to enable hoisting
      <React.Component onClick={hoistable} />;
    },
    props: {
      val: 1,
      nested: {val: 1},
    },
  };
})();
