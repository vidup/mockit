import { Mockit } from "../../Mockit";

function hello() {
  return "world";
}

describe("v2 hasBeenCalled", () => {
  it("should provide boolean for asserting how many times a method has been called", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.atLeastOnce).toBe(false);
    expect(spy.hasBeenCalled.once).toBe(false);
    expect(spy.hasBeenCalled.twice).toBe(false);
    expect(spy.hasBeenCalled.thrice).toBe(false);
    expect(spy.hasBeenCalled.nTimes(0)).toBe(true);
    expect(spy.hasBeenCalled.nTimes(4)).toBe(false);

    mock();
    expect(spy.hasBeenCalled.atLeastOnce).toBe(true);
    expect(spy.hasBeenCalled.once).toBe(true);
    expect(spy.hasBeenCalled.twice).toBe(false);
    expect(spy.hasBeenCalled.thrice).toBe(false);
    expect(spy.hasBeenCalled.nTimes(1)).toBe(true);
    expect(spy.hasBeenCalled.nTimes(4)).toBe(false);

    mock();
    expect(spy.hasBeenCalled.atLeastOnce).toBe(true);
    expect(spy.hasBeenCalled.once).toBe(false);
    expect(spy.hasBeenCalled.twice).toBe(true);
    expect(spy.hasBeenCalled.thrice).toBe(false);
    expect(spy.hasBeenCalled.nTimes(2)).toBe(true);
    expect(spy.hasBeenCalled.nTimes(4)).toBe(false);

    mock();
    expect(spy.hasBeenCalled.atLeastOnce).toBe(true);
    expect(spy.hasBeenCalled.once).toBe(false);
    expect(spy.hasBeenCalled.twice).toBe(false);
    expect(spy.hasBeenCalled.thrice).toBe(true);
    expect(spy.hasBeenCalled.nTimes(3)).toBe(true);
    expect(spy.hasBeenCalled.nTimes(4)).toBe(false);

    mock();
    expect(spy.hasBeenCalled.atLeastOnce).toBe(true);
    expect(spy.hasBeenCalled.once).toBe(false);
    expect(spy.hasBeenCalled.twice).toBe(false);
    expect(spy.hasBeenCalled.thrice).toBe(false);
    expect(spy.hasBeenCalled.nTimes(4)).toBe(true);
  });
});
