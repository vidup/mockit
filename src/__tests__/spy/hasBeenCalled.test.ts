import { Mockit } from "../..";
import { Person } from "../../test_utils/Person";

describe("Spy hasBeenCalled", () => {
  it("should be able to tell if a method has been called", () => {
    const mock = Mockit.mock(Person);
    const walkSpy = Mockit.spy(mock).method("walk");
    expect(walkSpy.hasBeenCalled).toBeFalsy();
    mock.walk();
    expect(walkSpy.hasBeenCalled).toBeTruthy();
  });

  it("should be able to tell if a method was called with specific args", () => {
    const mock = Mockit.mock(Person);
    const walkSpy = Mockit.spy(mock).method("walk");
    expect(walkSpy.hasBeenCalledWith(1)).toBeFalsy();
    mock.walk(1);
    expect(walkSpy.hasBeenCalledWith(1)).toBeTruthy();
  });

  it("should be able to tell if a method has been called a specific number of times", () => {
    const mock = Mockit.mock(Person);
    const methodSpy = Mockit.spy(mock).method("walk");
    expect(methodSpy.hasBeenCalledNTimes(1)).toBeFalsy();
    mock.walk(1);
    expect(methodSpy.hasBeenCalledNTimes(1)).toBeTruthy();
    expect(methodSpy.hasBeenCalledOnce).toBeTruthy();
    expect(methodSpy.hasBeenCalledOnceWith(1)).toBeTruthy();
    mock.walk(1);
    expect(methodSpy.hasBeenCalledOnce).toBeFalsy();
    expect(methodSpy.hasBeenCalledNTimes(2)).toBeTruthy();
    expect(methodSpy.hasBeenCalledTwice).toBeTruthy();
    expect(methodSpy.hasBeenCalledTwiceWith(1)).toBeTruthy();
    expect(methodSpy.hasBeenCalledNTimes(3)).toBeFalsy();

    mock.walk(1);
    expect(methodSpy.hasBeenCalledNTimes(3)).toBeTruthy();
    expect(methodSpy.hasBeenCalledThrice).toBeTruthy();
    expect(methodSpy.hasBeenCalledThriceWith(1)).toBeTruthy();
    expect(methodSpy.hasBeenCalledTwice).toBeFalsy();
  });

  it("should be able to tell if a method has been called with any string", () => {
    const mock = Mockit.mock(Person);
    const methodSpy = Mockit.spy(mock).method("walk");
    expect(methodSpy.hasBeenCalledWith(Mockit.any(String))).toBeFalsy();
    mock.walk("any");
    expect(methodSpy.hasBeenCalledWith(Mockit.any(String))).toBeTruthy();
    expect(methodSpy.hasBeenCalledOnceWith(Mockit.any(String))).toBeTruthy();
  });

  it("should be able to tell if a method has been called with any number", () => {
    const mock = Mockit.mock(Person);
    const methodSpy = Mockit.spy(mock).method("walk");
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Number))).toBeFalsy();
    mock.walk(1);
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Number))).toBeTruthy();
    expect(methodSpy.hasBeenCalledOnceWith(Mockit.any(Number))).toBeTruthy();
  });

  it("should be able to tell if a method has been called with any boolean", () => {
    const mock = Mockit.mock(Person);
    const methodSpy = Mockit.spy(mock).method("walk");
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Boolean))).toBeFalsy();
    mock.walk(true);
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Boolean))).toBeTruthy();
    expect(methodSpy.hasBeenCalledOnceWith(Mockit.any(Boolean))).toBeTruthy();
  });

  it("should be able to tell if a method has been called with any object", () => {
    const mock = Mockit.mock(Person);
    const methodSpy = Mockit.spy(mock).method("walk");
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Object))).toBeFalsy();
    mock.walk({});
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Object))).toBeTruthy();
    expect(methodSpy.hasBeenCalledOnceWith(Mockit.any(Object))).toBeTruthy();
  });

  it("should be able to tell if a method has been called with any array", () => {
    const mock = Mockit.mock(Person);
    const methodSpy = Mockit.spy(mock).method("walk");
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Array))).toBeFalsy();
    mock.walk([]);
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Array))).toBeTruthy();
    expect(methodSpy.hasBeenCalledOnceWith(Mockit.any(Array))).toBeTruthy();
  });

  it("should be able to tell if a method has been called with any function", () => {
    const mock = Mockit.mock(Person);
    const methodSpy = Mockit.spy(mock).method("walk");
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Function))).toBeFalsy();
    mock.walk(() => {});
    expect(methodSpy.hasBeenCalledWith(Mockit.any(Function))).toBeTruthy();
    expect(methodSpy.hasBeenCalledOnceWith(Mockit.any(Function))).toBeTruthy();

    mock.walk(
      new Date().valueOf(),
      // @ts-expect-error
      new Date().toISOString(),
      new Date(),
      Math.random(),
      { x: 1, y: { name: "Victor" } },
      [1, 2, 3]
    );

    methodSpy.hasBeenCalledWith(
      Mockit.any(Number),
      Mockit.any(String),
      Mockit.any(Object),
      Mockit.any(Number),
      Mockit.any(Object),
      Mockit.any(Array)
    );

    // methodSpy.hasBeenCalledWith(
    //   Mockit.any(Number),
    //   Mockit.any(String),
    //   Mockit.any(Object),
    //   Mockit.any(Number),
    //   { x: 1, y: { name: Mockit.any(String) } },
    //   Mockit.any(Array)
    // );
  });
});

describe("Deeper any scenarios", () => {
  it("should be able to check multiple any at the same time", () => {
    const mock = Mockit.mock(Person);
    const methodSpy = Mockit.spy(mock).method("walk");

    mock.walk(
      new Date().valueOf(),
      // @ts-expect-error
      new Date().toISOString(),
      new Date(),
      Math.random(),
      { x: 1, y: { name: "Victor" } },
      [1, 2, 3]
    );

    expect(
      methodSpy.hasBeenCalledWith(
        Mockit.any(Number),
        Mockit.any(String),
        Mockit.any(Object),
        Mockit.any(Number),
        Mockit.any(Object),
        Mockit.any(Array)
      )
    ).toBe(true);

    expect(
      methodSpy.hasBeenCalledWith(
        Mockit.any(Number),
        Mockit.any(String),
        Mockit.any(Object),
        "HELLAW, should fail",
        Mockit.any(Object),
        Mockit.any(Array)
      )
    ).toBe(false);
  });
});
