// @flow

import * as React from "react";

class MyComponent extends React.Component {
  render() {
    const isParam = 1;
    const notParam = 2;

    const hoistable = () => ({
      // `isParam` should become a parameter in the hoisted function
      [isParam]: 1,
      // `notParam` should NOT become a parameter in the hoisted function
      notParam: 2,
    });

    // Use in JSXExpressionContainer to enable hoisting
    return <React.Component onClick={hoistable} />;
  }
}
