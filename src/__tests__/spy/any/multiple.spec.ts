import { Mockit } from "../../../mockit";
import { z } from "zod";

function hello(...args: any[]) {
  return "hello";
}

describe("Spies with zod arguments", () => {
  it("should work with two arguments, one of which is any", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(z.string(), 1).atLeastOnce).toBe(false);
    mock(1, 1);
    expect(spy.hasBeenCalled.withArgs(z.string(), 1).atLeastOnce).toBe(false);
    mock("hello", 1);
    expect(spy.hasBeenCalled.withArgs(z.string(), 1).atLeastOnce).toBe(true);
  });

  it("should work in reverse", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(1, z.string()).atLeastOnce).toBe(false);
    mock(1, 1);
    expect(spy.hasBeenCalled.withArgs(1, z.string()).atLeastOnce).toBe(false);
    mock(1, "hello");
    expect(spy.hasBeenCalled.withArgs(1, z.string()).atLeastOnce).toBe(true);
  });

  it("should work for two any arguments", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(z.string(), z.number()).atLeastOnce).toBe(
      false
    );
    mock(1, 1);
    expect(spy.hasBeenCalled.withArgs(z.string(), z.number()).atLeastOnce).toBe(
      false
    );
    mock("hello", 1);
    expect(spy.hasBeenCalled.withArgs(z.string(), z.number()).atLeastOnce).toBe(
      true
    );

    expect(
      spy.hasBeenCalled.withArgs(
        z.string(),
        z.number(),
        z.object({}),
        z.array(z.any())
      ).atLeastOnce
    ).toBe(false);

    mock("hello", 1, {}, []);
    expect(
      spy.hasBeenCalled.withArgs(
        z.string(),
        z.number(),
        z.object({}),
        z.array(z.any())
      ).atLeastOnce
    ).toBe(true);
  });
});
