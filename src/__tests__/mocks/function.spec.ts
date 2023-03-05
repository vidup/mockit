import { Mockit } from "../../mockit";

function hellaw(...args: any[]) {
  return "hello world";
}

/**
 * All mocked methods are instances of FunctionMock => we can test it once here.
 */
describe("function mock", () => {
  it("should default to a returned undefined", () => {
    const mock = Mockit.mockFunction(hellaw);
    expect(mock()).toBeUndefined();
  });

  it("should allow to change the default behaviour", async () => {
    const mock = Mockit.mockFunction(hellaw);
    Mockit.when(mock).isCalled.thenReturn("hello");
    expect(mock()).toBe("hello");

    Mockit.when(mock).isCalled.thenThrow(new Error("error"));
    expect(() => mock()).toThrowError("error");

    let counter = 0;
    Mockit.when(mock).isCalled.thenCall(() => {
      counter++;
    });

    mock();
    mock();
    expect(counter).toBe(2);
    mock();
    expect(counter).toBe(3);

    Mockit.when(mock).isCalled.thenResolve("hello-resolved");
    expect(mock()).resolves.toBe("hello-resolved");

    Mockit.when(mock).isCalled.thenReject(new Error("hello-rejected"));
    expect(mock()).rejects.toThrowError("hello-rejected");
  });
});
