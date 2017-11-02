// @flow

import * as React from "react";

// Should not hoist because arrow function is already at the top level.
const shouldNotHoist = a => {
  return a;
};

{
  // Hoistable because it is in a different scope than the top level.
  const hoistable = a => {
    return a;
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistable} />;
}

// Use in JSXExpressionContainer to enable hoisting
<React.Component onClick={shouldNotHoist} />;
