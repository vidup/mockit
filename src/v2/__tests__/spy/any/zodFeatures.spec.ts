import { Mockit } from "../../../Mockit";

function hello(...args: any[]) {}

/**
 * I don't want to retest zod so this test only checks for the integration
 * between zod and Mockit, not the actual zod functionality
 */
describe("v2 with zod custom matchers", () => {
  it("should allow matching with numbers min", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.number.min(5).max(10)).atleastOnce
    ).toBe(false);
    mock(4);
    mock(11);
    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.number.min(5).max(10)).atleastOnce
    ).toBe(false);
    mock(5);
    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.number.min(5).max(10)).atleastOnce
    ).toBe(true);
  });

  it("should allow matching with numbers max", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.number.min(5).max(10)).atleastOnce
    ).toBe(false);
    mock(11);
    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.number.min(5).max(10)).atleastOnce
    ).toBe(false);
    mock(10);
    expect(
      spy.hasBeenCalled.withArgs(Mockit.any.number.min(5).max(10)).atleastOnce
    ).toBe(true);
  });
});
