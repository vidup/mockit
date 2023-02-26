import { Mockit } from "./Mockit";

function hello() {
  return "world";
}

describe("v2 hasBeenCalled", () => {
  it("should provide boolean for asserting how many times a method has been called", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled).toBe(false);
    expect(spy.hasBeenCalledOnce).toBe(false);
    expect(spy.hasBeenCalledTwice).toBe(false);
    expect(spy.hasBeenCalledThrice).toBe(false);
    expect(spy.hasBeenCalledNTimes(0)).toBe(true);
    expect(spy.hasBeenCalledNTimes(4)).toBe(false);

    mock();
    expect(spy.hasBeenCalled).toBe(true);
    expect(spy.hasBeenCalledOnce).toBe(true);
    expect(spy.hasBeenCalledTwice).toBe(false);
    expect(spy.hasBeenCalledThrice).toBe(false);
    expect(spy.hasBeenCalledNTimes(1)).toBe(true);
    expect(spy.hasBeenCalledNTimes(4)).toBe(false);

    mock();
    expect(spy.hasBeenCalled).toBe(true);
    expect(spy.hasBeenCalledOnce).toBe(false);
    expect(spy.hasBeenCalledTwice).toBe(true);
    expect(spy.hasBeenCalledThrice).toBe(false);
    expect(spy.hasBeenCalledNTimes(2)).toBe(true);
    expect(spy.hasBeenCalledNTimes(4)).toBe(false);

    mock();
    expect(spy.hasBeenCalled).toBe(true);
    expect(spy.hasBeenCalledOnce).toBe(false);
    expect(spy.hasBeenCalledTwice).toBe(false);
    expect(spy.hasBeenCalledThrice).toBe(true);
    expect(spy.hasBeenCalledNTimes(3)).toBe(true);
    expect(spy.hasBeenCalledNTimes(4)).toBe(false);

    mock();
    expect(spy.hasBeenCalled).toBe(true);
    expect(spy.hasBeenCalledOnce).toBe(false);
    expect(spy.hasBeenCalledTwice).toBe(false);
    expect(spy.hasBeenCalledThrice).toBe(false);
    expect(spy.hasBeenCalledNTimes(4)).toBe(true);
  });
});
