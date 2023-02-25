import { Mockit } from "./Mockit";

function hellaw(...args: any[]) {
  return "hello world";
}

describe("v2 function", () => {
  it("should default to a returned undefined", () => {
    const mock = Mockit.mockFunction(hellaw);
    expect(mock()).toBeUndefined();
  });

  it("should allow to change the default behaviour", async () => {
    const mock = Mockit.mockFunction(hellaw);
    Mockit.whenMethod(mock).isCalled.thenReturn("hello");
    expect(mock()).toBe("hello");

    Mockit.whenMethod(mock).isCalled.thenThrow(new Error("error"));
    expect(() => mock()).toThrowError("error");

    let counter = 0;
    Mockit.whenMethod(mock).isCalled.thenCall(() => {
      counter++;
    });

    mock();
    mock();
    expect(counter).toBe(2);
    mock();
    expect(counter).toBe(3);

    Mockit.whenMethod(mock).isCalled.thenResolve("hello-resolved");
    expect(mock()).resolves.toBe("hello-resolved");

    Mockit.whenMethod(mock).isCalled.thenReject(new Error("hello-rejected"));
    expect(mock()).rejects.toThrowError("hello-rejected");
  });
});
