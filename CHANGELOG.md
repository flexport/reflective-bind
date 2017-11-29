# Reflective Bind Change Log

All notable changes to this project will be documented in this file.

## Unreleased

* Add "log" option to log general transform info and warnings.
* Log info about which inline functions are transformed.
* Log warnings about sub-optimial code and how to fix it.

## 0.0.4-rc2

* Don't transform inline functions on `ref` prop.
* Don't transform arrow functions defined at the top level.
* Don't transform `fn[bind](...)`
* Use reflective equality when comparing reflectively bound arguments.
* Don't transform functions referencing a variable that is re-assigned in a
  different function.

## 0.0.3

* Support non-constant reference in arrow function as long as there is no
  reassignment to the variable after the arrow function.
* Don't transform inline functions on JSX html literals.

## 0.0.2

Initial release
