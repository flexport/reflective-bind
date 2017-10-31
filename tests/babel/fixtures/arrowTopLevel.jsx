// @flow

import * as React from "react";

const hoistable = () => {};

// Use in JSXExpressionContainer to enable hoisting
<React.Component onClick={hoistable} />;
