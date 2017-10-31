// @flow

import * as React from "react";

(function() {
  // Inline arrow fn in JSXExpressionContainer should be hoisted.
  // Nested arrow fn should also be hoisted.
  <React.Component
    onClick={() => {
      <React.Component
        onClick={() => {
          <React.Component />;
        }}
      />;
    }}
  />;
})();
