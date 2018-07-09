// @flow

import React from "react";

(function() {
  return {
    foo() {
      const hoistable = () => {
        // The entire `this.props.fn` should be hoisted because we don't
        // expect that `fn` cares about the `props` being its context.
        this.props.fn();

        // Only `this.props.nested` should be pulled out so that the call can
        // still look like `_temp.nestedFn()` to preserve the context.
        this.props.nested.nestedFn();

        // Only `this.props.nested` should be pulled out since we don't hoist
        // deep attribute accesses.
        this.props.nested.deepNested.deepNestedFn();

        // The entire `this.props["string.key.fn"]` should be hoisted because we don't
        // expect that `"string.key.fn"` cares about the `props` being its context.
        this.props["string.key.fn"]();

        // Using a second string function shouldn't fail. It should behave as the previous.
        this.props["another.string.key.fn"]();
      };

      // Use in JSXExpressionContainer to enable hoisting
      <React.Component onClick={hoistable} />;
    },
    props: {
      fn: () => {},
      nested: {
        nestedFn: () => {},
        deepNested: {
          deepNestedFn: () => {},
        },
      },
      "string.key.fn": () => {},
      "another.string.key.fn": () => {},
    },
  };
})();
