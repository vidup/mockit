import { Mockit } from "./Mockit";

function hello(...args: any[]) {
  return "hello world";
}

/**
 * All mocked methods are instances of FunctionMock => we can test it once here.
 */
describe("v2 function custom behaviour", () => {
  it("should initially work as intended", () => {
    expect(hello()).toBe("hello world");
  });

  test("mockit should be able to specify arguments related behaviours", () => {
    const mock = Mockit.mockFunction(hello);
    Mockit.whenMethod(mock).isCalledWith("hello").thenReturn("hello");
    Mockit.whenMethod(mock).isCalledWith("world").thenReturn("world");
    Mockit.whenMethod(mock).isCalledWith().thenReturn("undefinedinput");
    Mockit.whenMethod(mock).isCalled.thenReturn("default");

    expect(mock("hello")).toBe("hello");
    expect(mock("world")).toBe("world");
    expect(mock()).toBe("undefinedinput");
    expect(mock({ az: 2, y: 3 })).toBe("default");

    const throwingMock = Mockit.mockFunction(hello);
    Mockit.whenMethod(throwingMock).isCalledWith("hello").thenThrow("hello");
    Mockit.whenMethod(throwingMock).isCalledWith("world").thenThrow("world");
    Mockit.whenMethod(throwingMock).isCalledWith().thenThrow("undefinedinput");
    Mockit.whenMethod(throwingMock).isCalled.thenThrow("default");

    expect(() => throwingMock("hello")).toThrow("hello");
    expect(() => throwingMock("world")).toThrow("world");
    expect(() => throwingMock()).toThrow("undefinedinput");
    expect(() => throwingMock({ az: 2, y: 3 })).toThrow("default");

    const counter = { value: 0 };
    const callingMock = Mockit.mockFunction(hello);
    Mockit.whenMethod(callingMock)
      .isCalledWith("hello")
      .thenCall(() => {
        counter.value++;
      });
    Mockit.whenMethod(callingMock)
      .isCalledWith("world")
      .thenCall(() => {
        counter.value--;
      });

    Mockit.whenMethod(callingMock).isCalled.thenCall(() => {
      counter.value = 9999;
    });

    callingMock("hello");
    callingMock("hello");
    expect(counter.value).toBe(2);
    callingMock("hello");
    expect(counter.value).toBe(3);

    callingMock("world");
    callingMock("world");
    callingMock("world");
    expect(counter.value).toBe(0);

    callingMock();
    expect(counter.value).toBe(9999);

    const resolvingMock = Mockit.mockFunction(hello);
    Mockit.whenMethod(resolvingMock).isCalledWith("hello").thenResolve("hello");
    Mockit.whenMethod(resolvingMock).isCalledWith("world").thenResolve("world");
    Mockit.whenMethod(resolvingMock)
      .isCalledWith()
      .thenResolve("undefinedinput");
    Mockit.whenMethod(resolvingMock).isCalled.thenResolve("default");

    expect(resolvingMock("hello")).resolves.toBe("hello");
    expect(resolvingMock("world")).resolves.toBe("world");
    expect(resolvingMock()).resolves.toBe("undefinedinput");
    expect(resolvingMock({ az: 2, y: 3 })).resolves.toBe("default");

    const rejectingMock = Mockit.mockFunction(hello);
    Mockit.whenMethod(rejectingMock).isCalledWith("hello").thenReject("hello");
    Mockit.whenMethod(rejectingMock).isCalledWith("world").thenReject("world");
    Mockit.whenMethod(rejectingMock)
      .isCalledWith()
      .thenReject("undefinedinput");
    Mockit.whenMethod(rejectingMock).isCalled.thenReject("default");

    expect(rejectingMock("hello")).rejects.toBe("hello");
    expect(rejectingMock("world")).rejects.toBe("world");
    expect(rejectingMock()).rejects.toBe("undefinedinput");
    expect(rejectingMock({ az: 2, y: 3 })).rejects.toBe("default");
  });

  it("should be able to specific different behaviours for the same function", () => {
    const mock = Mockit.mockFunction(hello);
    let counter = 0;
    Mockit.whenMethod(mock).isCalledWith("hello").thenReturn("hello");
    Mockit.whenMethod(mock).isCalledWith("world").thenThrow("world");
    Mockit.whenMethod(mock)
      .isCalledWith()
      .thenCall(() => {
        counter++;
      });
    Mockit.whenMethod(mock).isCalled.thenResolve("default");
    Mockit.whenMethod(mock).isCalledWith("NOOO").thenReject("NOOO");

    expect(mock("hello")).toBe("hello");
    expect(() => mock("world")).toThrow("world");
    mock();
    expect(counter).toBe(1);
    mock();
    expect(counter).toBe(2);
    expect(mock("NOOO")).rejects.toBe("NOOO");
    expect(mock(undefined)).resolves.toBe("default");
  });
});
