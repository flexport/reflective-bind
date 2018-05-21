// @flow

import babelBind from "./babelBind";
import reflectiveBind, {reflectiveEqual, isReflective} from "./reflectiveBind";
import shallowReflectiveEqual from "./shallowReflectiveEqual";
import shouldComponentUpdate from "./shouldComponentUpdate";

export default reflectiveBind;
export {babelBind, reflectiveEqual, isReflective, shallowReflectiveEqual, shouldComponentUpdate};
