import { Mockit } from "../../";
import { Person } from "../../test_utils/Person";

describe("Spy hasBeenCalled", () => {
  it("should be able to tell if a method has been called", () => {
    const mock = Mockit.mock2(Person);
    const walkSpy = Mockit.spy2(mock).method("walk");
    expect(walkSpy.hasBeenCalled).toBeFalsy();
    mock.walk();
    expect(walkSpy.hasBeenCalled).toBeTruthy();
  });

  it("should be able to tell if a method was called with specific args", () => {
    const mock = Mockit.mock2(Person);
    const walkSpy = Mockit.spy2(mock).method("walk");
    expect(walkSpy.hasBeenCalledWith(1)).toBeFalsy();
    mock.walk(1);
    expect(walkSpy.hasBeenCalledWith(1)).toBeTruthy();
  });

  it("should be able to tell if a method has been called a specific number of times", () => {
    const mock = Mockit.mock2(Person);
    const methodSpy = Mockit.spy2(mock).method("walk");
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
});
