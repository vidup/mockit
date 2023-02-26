import { Mockit } from "./Mockit";

function hello(...args: any[]) {}

describe("V2 hasBeenCalledWith", () => {
  it("should provide functions asserting if a method has been called with a specific set of arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);
    Mockit.whenMethod(mock)
      .isCalledWith("hello")
      .thenCall(() => "world");

    expect(spy.hasBeenCalledWith("hello")).toBe(false);
    mock("hello");
    expect(spy.hasBeenCalledWith("hello")).toBe(true);
  });
});
