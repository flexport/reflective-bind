[![Build Status](https://travis-ci.org/flexport/reflective-bind.svg?branch=master)](https://travis-ci.org/flexport/reflective-bind)
[![codecov](https://codecov.io/gh/flexport/reflective-bind/branch/master/graph/badge.svg)](https://codecov.io/gh/flexport/reflective-bind)

# Reflective Bind

In React, using inline functions (arrow functions and `Function.prototype.bind`) in render will [cause pure components to wastefully re-render]((https://flexport.engineering/optimizing-react-rendering-part-1-9634469dca02)). As a result, many React developers encourage you to [never use inline functions](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md) in render. However, others think that [avoiding them is premature optimization](https://cdb.reacttraining.com/react-inline-functions-and-performance-bdff784f5578).

With reflective-bind, you can freely use inline functions in render without worrying about wasteful re-rendering of pure components.

The best part is, it requires almost no code change 🙌

## Installation

```sh
npm install --save reflective-bind
```

## Using the babel plugin

Add it to the top of your plugin list in `.babelrc` (it must be run before other plugins that transform arrow functions and `bind` calls):

```
"plugins": [
  "reflective-bind/babel",
  ...
]
```

And call reflective bind’s `shouldComponentUpdate` helper function in your component:

```js
import {shouldComponentUpdate} from "reflective-bind";

class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState);
  }
  ...
}
```

If you’re already using `React.PureComponent` and want to avoid updating all of your components, consider monkey patching `shouldComponentUpdate` 🙊

```js
import React from "react";
import {shouldComponentUpdate} from "reflective-bind";

React.PureComponent.prototype.shouldComponentUpdate = function(
  nextProps,
  nextState
) {
  return shouldComponentUpdate(this, nextProps, nextState);
};
```

If you do not want the babel plugin to process a specific file, add the following line to your file:

```js
// @no-reflective-bind-babel
```

### Dependencies
The babel plugin will add ES6 import declarations to your code. This shouldn’t be an issue if you’re using using `babel-preset-env` or `babel-preset-es2015`, but just make sure that some plugin/preset can transform the import declarations to your needs.

### What the plugin does

The plugin simply transforms inline functions into calls to `reflectiveBind`. This then allows the `shouldComponentUpdate` helper function to use `reflectiveEqual` in the shallow comparison equality check.

## Using reflectiveBind manually

Binding your function with `reflectiveBind` simply stores the original function, the context (thisArg), and the args on the bound function instance. This allows you to check if two reflectively bound functions are equal.

```js
import reflectiveBind, {reflectiveEqual} from "reflective-bind";

function baseFn(msg) {
  alert(msg);
}

const fn1 = reflectiveBind(baseFn, undefined, "hello");
const fn2 = reflectiveBind(baseFn, undefined, "hello");

fn1 === fn2 // false
reflectiveEqual(fn1, fn2) // true

const fn3 = reflectiveBind(baseFn, undefined, "world");
reflectiveEqual(fn1, fn3) // false
```

Note that `reflectiveEqual` only works for reflectively bound functions.

```js
reflectiveEqual(1, 1) // false
reflectiveEqual(baseFn, baseFn) // false
```

We also expose a `isReflective` helper function that lets you check if something is a reflectively bound function.

### Flow types

All exported functions are flow typed out of the box. `reflectiveBind` is typed with function overloading:

```
// Function with 0 args
declare function reflectiveBind<A>(f: () => A, ctx: mixed): () => A;

// Function with 1 arg
declare function reflectiveBind<A, B>(f: (A) => B, ctx: mixed): A => B;

declare function reflectiveBind<A, B>(f: (A) => B, ctx: mixed, a: A): () => B;

...
```

We currently support `reflectiveBind` calls up to 4 args:

```js
reflectiveBind(baseFn, ctx, a, b, c, d);
```

## Babel plugin examples

The following are examples of some inline functions that will be transformed into calls to `reflectiveBind` by the babel plugin:

- Inline arrow functions:

```jsx
function MyComponent(props) {
  const msg = "Hello " + props.user.name.first;
  return <PureChild onClick={() => alert(msg)} />
}
```

- `Function.prototype.bind`:

```jsx
function MyComponent(props) {
  const handleClick = props.callback.bind(undefined, "yay");
  return <PureChild onClick={handleClick} />
}
```

- Multiple assignments / reassignments:

```jsx
function MyComponent(props) {
  let handleClick = () => {...};
  
  if (...) {
      handleClick = () => {...};
  } else if (...) {
      handleClick = () => {...};
  }

  return <PureChild onClick={handleClick} />
}
```

- Ternary expressions:

```jsx
function MyComponent(props) {
  const handleClick = props.condition
    ? () => {...}
    : () => {...};

  return <PureChild onClick={handleClick} />
}
```

- For maximum optimization, avoid accessing nested attributes in your arrow function. Prefer to pull the nested value out to a const and close over it in your arrow function.

```jsx
function MyComponent(props) {
  
  // PureChild will re-render whenever `props` changes (bad)
  const badHandleClick = () =>  alert(props.user.name.first);
  
  const firstName = props.user.name.first;
  // Now, PureChild will only re-render when firstName changes (good)
  const goodHandleClick = () => alert(firstName);
  
  return (
    <div>
      <PureChild onClick={badHandleClick} />
      <PureChild onClick={goodHandleClick} />
    </div>
  );
}
```

### Unsupported cases

There are a few edge cases that can cause an arrow function to not be transformed. Nothing breaks, you just won’t have optimized code.

- Your arrow function should not close over variables whose value is set after the arrow function.

```jsx
function MyComponent(props) {
  let foo = 1;
  
  const badHandleClick = () => {
    // Referencing `foo`, which is reassigned after this arrow function, will
    // prevent this arrow function from being transformed.
    alert(foo);
  };
  
  foo = 2;

  return <PureChild onClick={badHandleClick} />
}
```

- Your arrow function must be defined inline the JSX, or at most 1 reference away.

```jsx
function MyComponent(props) {
  // This arrow function won't be transformed because `fn` is not referenced
  // directly in the JSX.
  const fn = () => {...};
  const badHandleClick = fn;
                    
  // This arrow function will be transformed since `goodHandleClick` is
  // referenced directly in the JSX.
  const goodHandleClick = () => {...};
                    
  return (
    <div>
      <PureChild onClick={badHandleClick} />
      
      <PureChild onClick={goodHandleClick} />
      
      {/* This will be optimized since it is defined directly in the JSX */}
      <PureChild onClick={() => {...}} />
    </div>
  );
}
```
