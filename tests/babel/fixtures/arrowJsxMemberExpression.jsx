// @flow

import * as React from "react";

(function() {
  const Component = props => {};

  // Should add `Component` as a parameter to the hoisted function, but not
  // `div` and `Whatever`.
  const hoistable = () => {
    <Component.Whatever>
      <div>1</div>
    </Component.Whatever>;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;
})();
