import { Mockit } from "../../Mockit";

function hello(...args: any[]) {}

describe("V2 hasBeenCalledWith", () => {
  it("should provide functions asserting if a method has been called at least once with a specific set of arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);
    Mockit.when(mock)
      .isCalledWith("hello")
      .thenCall(() => "world");

    expect(spy.hasBeenCalled.withArgs("hello").atLeastOnce).toBe(false);
    mock("hello");
    expect(spy.hasBeenCalled.withArgs("hello").atLeastOnce).toBe(true);

    mock("something else");
    expect(spy.hasBeenCalled.withArgs("hello").atLeastOnce).toBe(true);
    expect(spy.hasBeenCalled.withArgs("something else").atLeastOnce).toBe(true);

    mock({ hello: "world" });
    expect(spy.hasBeenCalled.withArgs({ hello: "world" }).atLeastOnce).toBe(
      true
    );

    mock({
      hello: "world",
      x: 2,
      y: new Map().set({ x: 2, y: 3 }, { secret: "bbq" }),
      w: new Set([1, 3, "Victor", { x: 2 }]),
      z: [1, 2, { x: 2 }, "Victor"],
    });

    expect(
      spy.hasBeenCalled.withArgs({
        hello: "world",
        x: 2,
        y: new Map().set({ x: 2, y: 3 }, { secret: "bbq" }),
        w: new Set([1, 3, "Victor", { x: 2 }]),
        z: [1, 2, { x: 2 }, "Victor"],
      }).atLeastOnce
    ).toBe(true);
  });

  it("should provide functions asserting how many times a method has been called with a specific set of arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);
    Mockit.when(mock)
      .isCalledWith("hello")
      .thenCall(() => "world");

    expect(spy.hasBeenCalled.withArgs("hello").once).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").twice).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").thrice).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").atLeastOnce).toBe(false);

    mock("hello");
    expect(spy.hasBeenCalled.withArgs("hello").once).toBe(true);
    expect(spy.hasBeenCalled.withArgs("hello").twice).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").thrice).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").atLeastOnce).toBe(true);

    mock("hello");
    expect(spy.hasBeenCalled.withArgs("hello").once).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").twice).toBe(true);
    expect(spy.hasBeenCalled.withArgs("hello").thrice).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").atLeastOnce).toBe(true);

    mock("hello");
    expect(spy.hasBeenCalled.withArgs("hello").once).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").twice).toBe(false);
    expect(spy.hasBeenCalled.withArgs("hello").thrice).toBe(true);
    expect(spy.hasBeenCalled.withArgs("hello").atLeastOnce).toBe(true);
  });
});
