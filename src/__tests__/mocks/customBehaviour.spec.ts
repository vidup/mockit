import { Mockit } from "../../Mockit";

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
    Mockit.when(mock).isCalledWith("hello").thenReturn("hello");
    Mockit.when(mock).isCalledWith("world").thenReturn("world");
    Mockit.when(mock).isCalledWith().thenReturn("undefinedinput");
    Mockit.when(mock).isCalled.thenReturn("default");

    expect(mock("hello")).toBe("hello");
    expect(mock("world")).toBe("world");
    expect(mock()).toBe("undefinedinput");
    expect(mock({ az: 2, y: 3 })).toBe("default");

    const throwingMock = Mockit.mockFunction(hello);
    Mockit.when(throwingMock).isCalledWith("hello").thenThrow("hello");
    Mockit.when(throwingMock).isCalledWith("world").thenThrow("world");
    Mockit.when(throwingMock).isCalledWith().thenThrow("undefinedinput");
    Mockit.when(throwingMock).isCalled.thenThrow("default");

    expect(() => throwingMock("hello")).toThrow("hello");
    expect(() => throwingMock("world")).toThrow("world");
    expect(() => throwingMock()).toThrow("undefinedinput");
    expect(() => throwingMock({ az: 2, y: 3 })).toThrow("default");

    const counter = { value: 0 };
    const callingMock = Mockit.mockFunction(hello);
    Mockit.when(callingMock)
      .isCalledWith("hello")
      .thenCall(() => {
        counter.value++;
      });
    Mockit.when(callingMock)
      .isCalledWith("world")
      .thenCall(() => {
        counter.value--;
      });

    Mockit.when(callingMock).isCalled.thenCall(() => {
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
    Mockit.when(resolvingMock).isCalledWith("hello").thenResolve("hello");
    Mockit.when(resolvingMock).isCalledWith("world").thenResolve("world");
    Mockit.when(resolvingMock).isCalledWith().thenResolve("undefinedinput");
    Mockit.when(resolvingMock).isCalled.thenResolve("default");

    expect(resolvingMock("hello")).resolves.toBe("hello");
    expect(resolvingMock("world")).resolves.toBe("world");
    expect(resolvingMock()).resolves.toBe("undefinedinput");
    expect(resolvingMock({ az: 2, y: 3 })).resolves.toBe("default");

    const rejectingMock = Mockit.mockFunction(hello);
    Mockit.when(rejectingMock).isCalledWith("hello").thenReject("hello");
    Mockit.when(rejectingMock).isCalledWith("world").thenReject("world");
    Mockit.when(rejectingMock).isCalledWith().thenReject("undefinedinput");
    Mockit.when(rejectingMock).isCalled.thenReject("default");

    expect(rejectingMock("hello")).rejects.toBe("hello");
    expect(rejectingMock("world")).rejects.toBe("world");
    expect(rejectingMock()).rejects.toBe("undefinedinput");
    expect(rejectingMock({ az: 2, y: 3 })).rejects.toBe("default");
  });

  it("should be able to specific different behaviours for the same function", () => {
    const mock = Mockit.mockFunction(hello);
    let counter = 0;
    Mockit.when(mock).isCalledWith("hello").thenReturn("hello");
    Mockit.when(mock).isCalledWith("world").thenThrow("world");
    Mockit.when(mock)
      .isCalledWith()
      .thenCall(() => {
        counter++;
      });
    Mockit.when(mock).isCalled.thenResolve("default");
    Mockit.when(mock).isCalledWith("NOOO").thenReject("NOOO");

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
