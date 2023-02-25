import { Mockit } from "./Mockit";

function hello(...args: any[]) {
  return "hello world";
}

describe("v2 function", () => {
  it("should initially work as intended", () => {
    expect(hello()).toBe("hello world");
  });

  test("mockit should be able to specify arguments related behaviours", () => {
    const mock = Mockit.mockFunction(hello);
    Mockit.whenMethod(mock).isCalledWith("hello").thenReturn("hello");
    Mockit.whenMethod(mock).isCalledWith("world").thenReturn("world");

    expect(mock("hello")).toBe("hello");
    expect(mock("world")).toBe("world");
  });
});
