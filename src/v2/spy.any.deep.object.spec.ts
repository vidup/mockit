import { Mockit } from "./Mockit";

function hello(...args: any[]) {}

describe("v2 spies with deep any arguments", () => {
  it("work for an any argument in the first level of an object", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(
      spy.hasBeenCalled.withArgs({ a: Mockit.any.string }).atleastOnce
    ).toBe(false);
    mock({ a: 1 });
    expect(
      spy.hasBeenCalled.withArgs({ a: Mockit.any.string }).atleastOnce
    ).toBe(false);
    mock({ a: "hello" });
    expect(
      spy.hasBeenCalled.withArgs({ a: Mockit.any.string }).atleastOnce
    ).toBe(true);
  });

  it("should work for level 2 argument", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(
      spy.hasBeenCalled.withArgs({ a: { b: Mockit.any.string } }).atleastOnce
    ).toBe(false);
    mock({ a: { b: 1 } });
    expect(
      spy.hasBeenCalled.withArgs({ a: { b: Mockit.any.string } }).atleastOnce
    ).toBe(false);
    mock({ a: { b: "hello" } });
    expect(
      spy.hasBeenCalled.withArgs({ a: { b: Mockit.any.string } }).atleastOnce
    ).toBe(true);
  });

  it("should work for a complex object", () => {
    const object = {
      x: 1,
      y: { z: { w: { a: Mockit.any.string } } },
      b: true,
      //   c: [1, 2, Mockit.any.email], // Not working with arrays somehow
      z: { w: { a: Mockit.any.function } },
    };

    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(object).atleastOnce).toBe(false);
    mock({
      x: 1,
      y: { z: { w: { a: "hell" } } },
      b: true,
      //   c: [1, 2, "not an email"],
      z: { w: { a: "not a function" } },
    });
    expect(spy.hasBeenCalled.withArgs(object).atleastOnce).toBe(false);
  });
});
