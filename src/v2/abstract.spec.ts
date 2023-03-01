import { Behaviour, NewBehaviourParam } from "../types/behaviour";

import { Mockit } from "./Mockit";

abstract class Hellaw {
  abstract hello(input: string): string;
  abstract world(): string;
}

describe("v2", () => {
  it("should setup default behaviour for abstract method", async () => {
    const returningMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(returningMock.hello).isCalled.thenReturn("world");

    expect(returningMock.hello("hello")).toBe("world");

    const throwingMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(throwingMock.hello).isCalled.thenThrow(
      new Error("error")
    );

    expect(() => throwingMock.hello("hello")).toThrowError("error");

    let counter = 0;
    const callingMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(callingMock.hello).isCalled.thenCall(() => {
      counter++;
    });

    callingMock.hello("hello");
    callingMock.hello("hello");
    expect(counter).toBe(2);
    callingMock.hello("hello");
    expect(counter).toBe(3);

    const resolvingMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(resolvingMock.hello).isCalled.thenResolve(
      "world-resolved"
    );

    const resolved = await resolvingMock.hello("hello");
    expect(resolved).toBe("world-resolved");

    const rejectingMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(rejectingMock.hello).isCalled.thenReject(
      new Error("error-rejected")
    );

    await expect(rejectingMock.hello("hello")).rejects.toThrowError(
      "error-rejected"
    );
  });
});
