// @flow

import * as React from "react";

(function() {
  // https://github.com/flexport/reflective-bind/issues/26
  // The transformed code with babel-env should have both calls to babelBind
  // transformed to something like (0, _src.babelBind)(...)

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={() => 1} />;
  <React.Component onClick={() => 2} />;
})();
