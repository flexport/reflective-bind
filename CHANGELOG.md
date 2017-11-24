# Reflective Bind Change Log

All notable changes to this project will be documented in this file.

## Unreleased

* Don't transform functions referencing a variable that is re-assigned in a
  different function.

## 0.0.4-rc1

* Don't transform inline functions on `ref` prop.
* Don't transform arrow functions defined at the top level.

## 0.0.3

* Support non-constant reference in arrow function as long as there is no
  reassignment to the variable after the arrow function.
* Don't transform inline functions on JSX html literals.

## 0.0.2

Initial release
