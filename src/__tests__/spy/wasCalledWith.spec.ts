import { Mockit } from "../../mockit";

function hello() {
  return "world";
}

describe("spy wasCalled.XXX", () => {
  it("should provide boolean for asserting how many times a method has been called", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalled.atLeastOnce).toBe(false);
    expect(spy.wasCalled.once).toBe(false);
    expect(spy.wasCalled.twice).toBe(false);
    expect(spy.wasCalled.thrice).toBe(false);
    expect(spy.wasCalled.nTimes(0)).toBe(true);
    expect(spy.wasCalled.nTimes(4)).toBe(false);

    mock();
    expect(spy.wasCalled.atLeastOnce).toBe(true);
    expect(spy.wasCalled.once).toBe(true);
    expect(spy.wasCalled.twice).toBe(false);
    expect(spy.wasCalled.thrice).toBe(false);
    expect(spy.wasCalled.nTimes(1)).toBe(true);
    expect(spy.wasCalled.nTimes(4)).toBe(false);

    mock();
    expect(spy.wasCalled.atLeastOnce).toBe(true);
    expect(spy.wasCalled.once).toBe(false);
    expect(spy.wasCalled.twice).toBe(true);
    expect(spy.wasCalled.thrice).toBe(false);
    expect(spy.wasCalled.nTimes(2)).toBe(true);
    expect(spy.wasCalled.nTimes(4)).toBe(false);

    mock();
    expect(spy.wasCalled.atLeastOnce).toBe(true);
    expect(spy.wasCalled.once).toBe(false);
    expect(spy.wasCalled.twice).toBe(false);
    expect(spy.wasCalled.thrice).toBe(true);
    expect(spy.wasCalled.nTimes(3)).toBe(true);
    expect(spy.wasCalled.nTimes(4)).toBe(false);

    mock();
    expect(spy.wasCalled.atLeastOnce).toBe(true);
    expect(spy.wasCalled.once).toBe(false);
    expect(spy.wasCalled.twice).toBe(false);
    expect(spy.wasCalled.thrice).toBe(false);
    expect(spy.wasCalled.nTimes(4)).toBe(true);
  });
});
