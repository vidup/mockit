import { Mockit } from "./Mockit";

function hello(...args: any[]) {}

describe("V2 hasBeenCalledWith", () => {
  it("should provide functions asserting if a method has been called with a specific set of arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);
    Mockit.whenMethod(mock)
      .isCalledWith("hello")
      .thenCall(() => "world");

    expect(spy.hasBeenCalledWith("hello").atLeastOnce).toBe(false);
    mock("hello");
    expect(spy.hasBeenCalledWith("hello").ONCE).toBe(true);

    mock("something else");
    expect(spy.hasBeenCalledWith("hello").ONCE).toBe(true);
    expect(spy.hasBeenCalledWith("something else").ONCE).toBe(true);

    mock({ hello: "world" });
    expect(spy.hasBeenCalledWith({ hello: "world" }).ONCE).toBe(true);

    mock({
      hello: "world",
      x: 2,
      y: new Map().set({ x: 2, y: 3 }, { secret: "bbq" }),
      w: new Set([1, 3, "Victor", { x: 2 }]),
      z: [1, 2, { x: 2 }, "Victor"],
    });

    expect(
      spy.hasBeenCalledWith({
        hello: "world",
        x: 2,
        y: new Map().set({ x: 2, y: 3 }, { secret: "bbq" }),
        w: new Set([1, 3, "Victor", { x: 2 }]),
        z: [1, 2, { x: 2 }, "Victor"],
      }).ONCE
    ).toBe(true);
  });

  it.skip("should provide functions asserting how many times a method has been called with a specific set of arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);
    Mockit.whenMethod(mock)
      .isCalledWith("hello")
      .thenCall(() => "world");

    expect(spy.hasBeenCalledWith("hello")).toBe(false);
    mock("hello");
  });
});
