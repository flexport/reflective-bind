// @flow

import reflectiveBind, {
  isReflective,
  reflectiveEqual,
  shouldComponentUpdate,
} from "../src";

describe("reflectiveBind11", () => {
  function foo(a: number) {
    return a;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1);
    expect(x()).toBe(1);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1]);
  });
});

describe("reflectiveBind21", () => {
  function foo(a: number, b: number) {
    return a + b;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1);
    expect(x(1)).toBe(2);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1]);
  });
});

describe("reflectiveBind31", () => {
  function foo(a: number, b: number, c: number) {
    return a + b + c;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1);
    expect(x(1, 1)).toBe(3);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1]);
  });
});

describe("reflectiveBind41", () => {
  function foo(a: number, b: number, c: number, d: number) {
    return a + b + c + d;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1);
    expect(x(1, 1, 1)).toBe(4);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1]);
  });
});

describe("reflectiveBind22", () => {
  function foo(a: number, b: number) {
    return a + b;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1, 1);
    expect(x()).toBe(2);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1, 1]);
  });
});

describe("reflectiveBind32", () => {
  function foo(a: number, b: number, c: number) {
    return a + b + c;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1, 1);
    expect(x(1)).toBe(3);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1, 1]);
  });
});

describe("reflectiveBind42", () => {
  function foo(a: number, b: number, c: number, d: number) {
    return a + b + c + d;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1, 1);
    expect(x(1, 1)).toBe(4);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1, 1]);
  });
});

describe("reflectiveBind33", () => {
  function foo(a: number, b: number, c: number) {
    return a + b + c;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1, 1, 1);
    expect(x()).toBe(3);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1, 1, 1]);
  });
});

describe("reflectiveBind43", () => {
  function foo(a: number, b: number, c: number, d: number) {
    return a + b + c + d;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1, 1, 1);
    expect(x(1)).toBe(4);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1, 1, 1]);
  });
});

describe("reflectiveBind44", () => {
  function foo(a: number, b: number, c: number, d: number) {
    return a + b + c + d;
  }
  it("creates a function", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1, 1, 1, 1);
    expect(x()).toBe(4);
    expect(x.__func).toBe(foo);
    expect(x.__ctx).toBe(ctx);
    expect(x.__args).toEqual([1, 1, 1, 1]);
  });
});

it("binds the correct context", () => {
  const ctx1 = {name: "foo"};
  const ctx2 = {name: "bar"};
  function fn() {
    return this.name;
  }
  const fn1 = reflectiveBind(fn, ctx1);
  const fn2 = reflectiveBind(fn, ctx2);
  expect(fn1()).toBe("foo");
  expect(fn2()).toBe("bar");
});

it("does not reflectively bind if fn.bind() returns the same fn", () => {
  // Simulate behavior of a React.createClass method by just returning the same
  // function from bind.
  const fn = a => a;
  fn.bind = (jest.fn(() => fn): any);
  const fn1 = reflectiveBind(fn, undefined, 1);
  expect(fn1).toBe(fn);
  expect(isReflective(fn1)).toBe(false);
  expect((fn.bind: any).mock.calls.length).toBe(1);
  expect((fn.bind: any).mock.calls[0][0]).toBeUndefined();
  expect((fn.bind: any).mock.calls[0][1]).toBe(1);
});

describe("reflectiveEqual", () => {
  function foo(a: number, b: string) {
    return `${a} - ${b}`;
  }

  function bar(a: number, b: string) {
    return `${a} - ${b}`;
  }

  it("returns true with functions of the same arguments", () => {
    const x = reflectiveBind(foo, null, 1, "bar");
    const y = reflectiveBind(foo, null, 1, "bar");
    expect(reflectiveEqual(x, y)).toBe(true);
  });

  it("returns false with functions of different arguments", () => {
    const x = reflectiveBind(foo, null, 1, "bar");
    const y = reflectiveBind(foo, null, 1, "baz");
    expect(reflectiveEqual(x, y)).toBe(false);
  });

  it("returns false with different functions", () => {
    const x = reflectiveBind(foo, null, 1, "bar");
    const y = reflectiveBind(bar, null, 1, "bar");
    expect(reflectiveEqual(x, y)).toBe(false);
  });

  it("returns false with different arity functions", () => {
    const x = reflectiveBind(foo, null, 1);
    const y = reflectiveBind(bar, null, 1, "bar");
    expect(reflectiveEqual(x, y)).toBe(false);
  });

  it("returns false with the same not reflectively bound function", () => {
    expect(reflectiveEqual(foo, foo)).toBe(false);
  });

  it("returns false with different not reflectively bound functions", () => {
    expect(reflectiveEqual(foo, bar)).toBe(false);
  });

  it("returns false for null equality", () => {
    expect(reflectiveEqual(null, null)).toBe(false);
  });

  it("returns false for object equality", () => {
    const foo = {bar: 1};
    expect(reflectiveEqual(foo, foo)).toBe(false);
  });

  it("returns false for function and undefined", () => {
    const foo = x => x;
    expect(reflectiveEqual(foo)).toBe(false);
  });

  it("returns true for same contexts", () => {
    const ctx = {};
    const x = reflectiveBind(foo, ctx, 1, "bar");
    const y = reflectiveBind(foo, ctx, 1, "bar");
    expect(reflectiveEqual(x, y)).toBe(true);
  });

  it("returns false for different contexts", () => {
    const x = reflectiveBind(foo, {}, 1, "bar");
    const y = reflectiveBind(foo, {}, 1, "bar");
    expect(reflectiveEqual(x, y)).toBe(false);
  });

  it("returns true when reflective binding a reflective bound fn with same args", () => {
    const baseX = reflectiveBind(foo, null, 1);
    const baseY = reflectiveBind(foo, null, 1);
    const x = reflectiveBind(baseX, null, "bar");
    const y = reflectiveBind(baseY, null, "bar");
    expect(reflectiveEqual(x, y)).toBe(true);
  });

  it("returns true when base fn is the same and args are different but reflectively equal", () => {
    const foo = x => x;
    const arg1 = reflectiveBind(foo, null, 1);
    const arg2 = reflectiveBind(foo, null, 1);
    const base = y => y;
    const x = reflectiveBind(base, null, arg1);
    const y = reflectiveBind(base, null, arg2);
    expect(reflectiveEqual(x, y)).toBe(true);
  });

  it("returns false when reflective binding a reflective bound fn with different args", () => {
    const baseX = reflectiveBind(foo, null, 1);
    const baseY = reflectiveBind(foo, null, 1);
    const x = reflectiveBind(baseX, null, "bar");
    const y = reflectiveBind(baseY, null, "other");
    expect(reflectiveEqual(x, y)).toBe(false);
  });

  it("returns false when reflective binding a reflective bound fn with different context", () => {
    const baseX = reflectiveBind(foo, null, 1);
    const baseY = reflectiveBind(foo, null, 1);
    const x = reflectiveBind(baseX, {}, "bar");
    const y = reflectiveBind(baseY, {}, "bar");
    expect(reflectiveEqual(x, y)).toBe(false);
  });
});

describe("isReflective", () => {
  it("returns false for non-functions", () => {
    expect(isReflective(1)).toBe(false);
    expect(isReflective({})).toBe(false);
    expect(isReflective([])).toBe(false);
    expect(isReflective("hi")).toBe(false);
    expect(isReflective(null)).toBe(false);
    expect(isReflective(undefined)).toBe(false);
  });

  it("returns false for non-reflectively bound functions", () => {
    function foo() {}
    const bound = foo.bind(null);
    expect(isReflective(bound)).toBe(false);
  });

  it("returns true for functions that are reflectively bound", () => {
    function foo() {}
    const bound = reflectiveBind(foo, null);
    expect(isReflective(bound)).toBe(true);
  });
});

describe("flow tests", () => {
  function foo0() {}
  function foo1(a: number) {}
  function foo2(a: number, b: string) {}
  function foo3(a: number, b: string, c: {}) {}
  function foo4(a: number, b: string, c: {}, d: Array<number>) {}
  function foo5(a: number, b: string, c: {}, d: Array<number>, e: null) {}

  reflectiveBind(foo0, null);
  // Hopefully we can make this an error in the future.
  // foo0.bind(null, "extra") results in an error, but since flow allows you to pass
  // a function that takes less args than the one specified by the function
  // argument, our typechecking cannot catch this.
  reflectiveBind(foo0, null, "extra");

  reflectiveBind(foo1, null);
  reflectiveBind(foo1, null, 1);
  // Hopefully we can make this an error in the future.
  reflectiveBind(foo1, null, 1, "extra");
  // $ExpectError
  reflectiveBind(foo1, null, "not number");

  reflectiveBind(foo2, null);
  reflectiveBind(foo2, null, 1);
  reflectiveBind(foo2, null, 1, "hi");
  // Hopefully we can make this an error in the future.
  reflectiveBind(foo2, null, 1, "hi", "extra");
  // $ExpectError
  reflectiveBind(foo2, null, "not number");
  // $ExpectError
  reflectiveBind(foo2, null, 1, 1);

  reflectiveBind(foo3, null);
  reflectiveBind(foo3, null, 1);
  reflectiveBind(foo3, null, 1, "hi");
  reflectiveBind(foo3, null, 1, "hi", {});
  // Hopefully we can make this an error in the future.
  reflectiveBind(foo3, null, 1, "hi", {}, "extra");
  // $ExpectError
  reflectiveBind(foo3, null, "not number");
  // $ExpectError
  reflectiveBind(foo3, null, 1, 1);
  // $ExpectError
  reflectiveBind(foo3, null, 1, "hi", "not object");

  reflectiveBind(foo4, null);
  reflectiveBind(foo4, null, 1);
  reflectiveBind(foo4, null, 1, "hi");
  reflectiveBind(foo4, null, 1, "hi", {});
  reflectiveBind(foo4, null, 1, "hi", {}, []);
  // reflectiveBind does not support binding more than 4 args
  // $ExpectError
  reflectiveBind(foo4, null, 1, "hi", {}, [], "extra");
  // $ExpectError
  reflectiveBind(foo4, null, "not number");
  // $ExpectError
  reflectiveBind(foo4, null, 1, 1);
  // $ExpectError
  reflectiveBind(foo4, null, 1, "hi", "not object");
  // $ExpectError
  reflectiveBind(foo4, null, 1, "hi", {}, "not array");

  // reflectiveBind does not support binding to a function that takes more than
  // 4 args
  // $ExpectError
  reflectiveBind(foo5, null);
});

describe("shouldComponentUpdate", () => {
  function foo() {}

  it("returns true if state changed", () => {
    const component = {
      props: {},
      state: {fn: reflectiveBind(foo, null)},
    };
    const changedState = {fn: reflectiveBind(foo, {})};
    expect(shouldComponentUpdate(component, {}, changedState)).toBe(true);
  });

  it("returns true if props changed", () => {
    const component = {
      props: {fn: reflectiveBind(foo, null)},
      state: {},
    };
    const changedProps = {fn: reflectiveBind(foo, {})};
    expect(shouldComponentUpdate(component, changedProps, {})).toBe(true);
  });

  it("returns false if nothing changed", () => {
    const component = {
      props: {fn: reflectiveBind(foo, null)},
      state: {fn: reflectiveBind(foo, null)},
    };
    const sameProps = {fn: reflectiveBind(foo, null)};
    const sameState = {fn: reflectiveBind(foo, null)};
    expect(shouldComponentUpdate(component, sameProps, sameState)).toBe(false);
  });
});
