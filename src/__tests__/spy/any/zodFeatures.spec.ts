import { z } from "zod";
import { Mockit } from "../../../mockit";

function hello(...args: any[]) {}

/**
 * I don't want to retest zod so this test only checks for the integration
 * between zod and Mockit, not the actual zod functionality
 */
describe("Spy: precise call matchers", () => {
  it("should allow matching with numbers min", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(
      spy.hasBeenCalled.withArgs(z.number().min(5).max(10)).atLeastOnce
    ).toBe(false);
    mock(4);
    mock(11);
    expect(
      spy.hasBeenCalled.withArgs(z.number().min(5).max(10)).atLeastOnce
    ).toBe(false);
    mock(5);
    expect(
      spy.hasBeenCalled.withArgs(z.number().min(5).max(10)).atLeastOnce
    ).toBe(true);
  });

  it("should allow matching with numbers max", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(
      spy.hasBeenCalled.withArgs(z.number().min(5).max(10)).atLeastOnce
    ).toBe(false);
    mock(11);
    expect(
      spy.hasBeenCalled.withArgs(z.number().min(5).max(10)).atLeastOnce
    ).toBe(false);
    mock(10);
    expect(
      spy.hasBeenCalled.withArgs(z.number().min(5).max(10)).atLeastOnce
    ).toBe(true);
  });
});
