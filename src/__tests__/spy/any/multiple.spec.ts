import { Mockit } from "../../../mockit";

function hello(...args: any[]) {
  return "hello";
}

describe("v2 spies with any arguments", () => {
  it("should work with two arguments, one of which is any", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.string, 1).atLeastOnce).toBe(
      false
    );
    mock(1, 1);
    expect(spy.hasBeenCalled.withArgs(Mockit.any.string, 1).atLeastOnce).toBe(
      false
    );
    mock("hello", 1);
    expect(spy.hasBeenCalled.withArgs(Mockit.any.string, 1).atLeastOnce).toBe(
      true
    );
  });

  it("should work in reverse", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(1, Mockit.any.string).atLeastOnce).toBe(
      false
    );
    mock(1, 1);
    expect(spy.hasBeenCalled.withArgs(1, Mockit.any.string).atLeastOnce).toBe(
      false
    );
    mock(1, "hello");
    expect(spy.hasBeenCalled.withArgs(1, Mockit.any.string).atLeastOnce).toBe(
      true
    );
  });

  it("should work for two any arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.string, Mockit.any.number)
        .atLeastOnce
    ).toBe(false);
    mock(1, 1);
    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.string, Mockit.any.number)
        .atLeastOnce
    ).toBe(false);
    mock("hello", 1);
    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.string, Mockit.any.number)
        .atLeastOnce
    ).toBe(true);

    expect(
      spy.hasBeenCalled.withArgs(
        Mockit.any.string,
        Mockit.any.number,
        Mockit.any.object,
        Mockit.any.array
      ).atLeastOnce
    ).toBe(false);

    mock("hello", 1, {}, []);
    expect(
      spy.hasBeenCalled.withArgs(
        Mockit.any.string,
        Mockit.any.number,
        Mockit.any.object,
        Mockit.any.array
      ).atLeastOnce
    ).toBe(true);
  });
});
