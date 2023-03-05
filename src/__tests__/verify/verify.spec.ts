import { z } from "zod";
import { mockFunction, suppose, verify } from "../../mockit";

function hello(..._args: any[]) {}

describe("suppose then verify", () => {
  it("should pass if the function has been called at least once", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalled.atLeastOnce;

    mock();
    verify(mock);
  });

  it("should throw if the function has not been called", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalled.atLeastOnce;

    expect(() => verify(mock)).toThrow();
  });

  it("should pass allow multiple suppositions", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalled.atLeastOnce;
    suppose(mock).willBeCalled.twice;

    mock();
    mock();
    verify(mock);
  });

  it("should not pass if the function has not been called enough times", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalled.twice;

    mock();
    expect(() => verify(mock)).toThrow();

    mock();
    verify(mock);
  });

  it("should work with specific arguments", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalledWith("hello").once;

    mock("hello");
    verify(mock);

    suppose(mock).willBeCalledWith(2).atLeastOnce;
    expect(() => verify(mock)).toThrow();

    mock(2);
    verify(mock);
  });

  it("should accept zod schemas", () => {
    const mock = mockFunction(hello);
    suppose(mock).willBeCalledWith(z.number()).once;

    mock(2);
    verify(mock);

    suppose(mock).willBeCalledWith(z.string()).once;

    mock("hello");
    verify(mock);
  });
});
