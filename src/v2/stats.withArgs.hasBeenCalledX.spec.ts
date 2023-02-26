import { Mockit } from "./Mockit";

function hello(...args: any[]) {}

describe("V2 hasBeenCalledWith", () => {
  it("should provide functions asserting if a method has been called with a specific set of arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);
    Mockit.whenMethod(mock)
      .isCalledWith("hello")
      .thenCall(() => "world");

    expect(spy.withArgs("hello").hasBeenCalled).toBe(false);
    mock("hello");
    expect(spy.withArgs("hello").hasBeenCalled).toBe(true);

    mock("something else");
    expect(spy.withArgs("hello").hasBeenCalled).toBe(true);
    expect(spy.withArgs("something else").hasBeenCalled).toBe(true);

    mock({ hello: "world" });
    expect(spy.withArgs({ hello: "world" }).hasBeenCalled).toBe(true);

    mock({
      hello: "world",
      x: 2,
      y: new Map().set({ x: 2, y: 3 }, { secret: "bbq" }),
      w: new Set([1, 3, "Victor", { x: 2 }]),
      z: [1, 2, { x: 2 }, "Victor"],
    });

    expect(
      spy.withArgs({
        hello: "world",
        x: 2,
        y: new Map().set({ x: 2, y: 3 }, { secret: "bbq" }),
        w: new Set([1, 3, "Victor", { x: 2 }]),
        z: [1, 2, { x: 2 }, "Victor"],
      }).hasBeenCalled
    ).toBe(true);
  });

  it.skip("should provide functions asserting how many times a method has been called with a specific set of arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);
    Mockit.whenMethod(mock)
      .isCalledWith("hello")
      .thenCall(() => "world");

    expect(spy.withArgs("hello").hasBeenCalledOnce).toBe(false);
    expect(spy.withArgs("hello").hasBeenCalledTwice).toBe(false);
    expect(spy.withArgs("hello").hasBeenCalledThrice).toBe(false);
    mock("hello");
    expect(spy.withArgs("hello").hasBeenCalledOnce).toBe(true);
    expect(spy.withArgs("hello").hasBeenCalledTwice).toBe(false);
    expect(spy.withArgs("hello").hasBeenCalledThrice).toBe(false);

    mock("hello");
    expect(spy.withArgs("hello").hasBeenCalledOnce).toBe(false);
    expect(spy.withArgs("hello").hasBeenCalledTwice).toBe(true);
    expect(spy.withArgs("hello").hasBeenCalledThrice).toBe(false);

    mock("hello");
    expect(spy.withArgs("hello").hasBeenCalledOnce).toBe(false);
    expect(spy.withArgs("hello").hasBeenCalledTwice).toBe(false);
    expect(spy.withArgs("hello").hasBeenCalledThrice).toBe(true);
  });
});
