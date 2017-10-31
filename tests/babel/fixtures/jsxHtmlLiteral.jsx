// @flow

import * as React from "react";

(function() {
  // Should not hoist because the callback is attached to a html literal, and
  // not a component.
  const shouldNotHoist = () => {
    return 1;
  };

  <div onClick={shouldNotHoist} />;
})();
