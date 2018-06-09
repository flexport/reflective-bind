// @flow

import React from "react";

class MyComponent extends React.Component<{|a: number|}> {
  render() {
    const hoistable = () => {
      // There should only be one parameter in the hoisted function
      this.props["a"];
      this.props["a"];
    };

    // Use in JSXExpressionContainer to enable hoisting
    return <React.Component onClick={hoistable} />;
  }
}
