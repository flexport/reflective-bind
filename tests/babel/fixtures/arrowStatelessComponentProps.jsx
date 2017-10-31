// @flow

import React from "react";

// eslint-disable-next-line no-unused-vars
function MyComponent(props: {nested: {callback: () => void}}) {
  const hoistable = () => {
    // Only `props` should be hoisted because we don't hoist deep attribute
    // access.
    props.nested.callback();
  };

  return <React.Component onClick={hoistable} />;
}
