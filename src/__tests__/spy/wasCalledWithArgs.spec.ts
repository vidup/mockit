import { Mockit } from "../../mockit";

function hello(...args: any[]) {}

describe("spy wasCalledWith.withArgs(...).XXX", () => {
  it("should provide functions asserting if a method has been called at least once with a specific set of arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);
    Mockit.when(mock)
      .isCalledWith("hello")
      .thenCall(() => "world");

    expect(spy.wasCalledWith("hello").atLeastOnce).toBe(false);
    mock("hello");
    expect(spy.wasCalledWith("hello").atLeastOnce).toBe(true);

    mock("something else");
    expect(spy.wasCalledWith("hello").atLeastOnce).toBe(true);
    expect(spy.wasCalledWith("something else").atLeastOnce).toBe(true);

    mock({ hello: "world" });
    expect(spy.wasCalledWith({ hello: "world" }).atLeastOnce).toBe(true);

    mock({
      hello: "world",
      x: 2,
      y: new Map().set({ x: 2, y: 3 }, { secret: "bbq" }),
      w: new Set([1, 3, "Victor", { x: 2 }]),
      z: [1, 2, { x: 2 }, "Victor"],
    });

    expect(
      spy.wasCalledWith({
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

    expect(spy.wasCalledWith("hello").once).toBe(false);
    expect(spy.wasCalledWith("hello").twice).toBe(false);
    expect(spy.wasCalledWith("hello").thrice).toBe(false);
    expect(spy.wasCalledWith("hello").atLeastOnce).toBe(false);

    mock("hello");
    expect(spy.wasCalledWith("hello").once).toBe(true);
    expect(spy.wasCalledWith("hello").twice).toBe(false);
    expect(spy.wasCalledWith("hello").thrice).toBe(false);
    expect(spy.wasCalledWith("hello").atLeastOnce).toBe(true);

    mock("hello");
    expect(spy.wasCalledWith("hello").once).toBe(false);
    expect(spy.wasCalledWith("hello").twice).toBe(true);
    expect(spy.wasCalledWith("hello").thrice).toBe(false);
    expect(spy.wasCalledWith("hello").atLeastOnce).toBe(true);

    mock("hello");
    expect(spy.wasCalledWith("hello").once).toBe(false);
    expect(spy.wasCalledWith("hello").twice).toBe(false);
    expect(spy.wasCalledWith("hello").thrice).toBe(true);
    expect(spy.wasCalledWith("hello").atLeastOnce).toBe(true);
  });
});
