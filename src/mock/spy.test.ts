class Something {
  public doSomething(...args: any[]) {
    return 1;
  }
}

import { Mockit } from "../mockit";

describe("Unit spy", () => {
  test("it should handle matching keys that were absent from some calls", () => {
    const call1 = { name: "call1" };
    const call2 = { name: "call2", ical: { filename: "something" } };
    const call3 = {};

    const mock = Mockit.mock(Something);
    const spy = Mockit.spy(mock).method("doSomething");

    mock.doSomething(call1);
    mock.doSomething(call2);
    mock.doSomething(call3);

    expect(spy.hasBeenCalledWith(call1)).toBe(true);
    expect(spy.hasBeenCalledWith(call2)).toBe(true);
    expect(
      spy.hasBeenCalledWith({
        name: Mockit.any(String),
        ical: {
          filename: Mockit.any(String),
        },
      })
    ).toBe(true);
  });
});
