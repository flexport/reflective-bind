// @flow
// https://flow.org/en/docs/types/utilities/#toc-objmap

import * as React from "react";

(function() {
  const hoistMeWithoutFlowIdentifiers = () => {
    // eslint-disable-next-line space-before-function-paren, no-unused-vars
    function run<A, O: {[key: string]: () => A}>(
      o: O
    ): $ObjMap<O, <V>(() => V) => V> {
      return Object.keys(o).reduce(
        (acc, k) => Object.assign(acc, {[k]: o[k]()}),
        {}
      );
    }
  };

  // Use in JSXExpressionContainer to enable hoisting
  <React.Component onClick={hoistMeWithoutFlowIdentifiers} />;
})();
