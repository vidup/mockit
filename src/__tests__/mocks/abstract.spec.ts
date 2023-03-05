import { mockAbstract, when } from "../../mockit";

abstract class Hellaw {
  abstract hello(input: string): string;
  abstract world(): string;
}

describe("v2", () => {
  it("should setup default behaviour for abstract method", async () => {
    const returningMock = mockAbstract(Hellaw, ["hello"]);
    when(returningMock.hello).isCalled.thenReturn("world");

    expect(returningMock.hello("hello")).toBe("world");

    const throwingMock = mockAbstract(Hellaw, ["hello"]);
    when(throwingMock.hello).isCalled.thenThrow(new Error("error"));

    expect(() => throwingMock.hello("hello")).toThrowError("error");

    let counter = 0;
    const callingMock = mockAbstract(Hellaw, ["hello"]);
    when(callingMock.hello).isCalled.thenCall(() => {
      counter++;
    });

    callingMock.hello("hello");
    callingMock.hello("hello");
    expect(counter).toBe(2);
    callingMock.hello("hello");
    expect(counter).toBe(3);

    const resolvingMock = mockAbstract(Hellaw, ["hello"]);
    when(resolvingMock.hello).isCalled.thenResolve("world-resolved");

    const resolved = await resolvingMock.hello("hello");
    expect(resolved).toBe("world-resolved");

    const rejectingMock = mockAbstract(Hellaw, ["hello"]);
    when(rejectingMock.hello).isCalled.thenReject(new Error("error-rejected"));

    await expect(rejectingMock.hello("hello")).rejects.toThrowError(
      "error-rejected"
    );
  });
});
