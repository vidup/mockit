import { Mockit } from "../../mockit";

class Hellaw {
  public hello(): string {
    return "world";
  }
  public world(): string {
    return "world";
  }

  helloworld() {
    return "helloworld";
  }

  helloworld2 = () => {
    return "helloworld";
  };
}

describe("v2 class", () => {
  it("the mock should contain all the public functions of the original class", async () => {
    const mock = Mockit.mock(Hellaw);
    expect(mock.hello).toBeDefined();
    expect(mock.world).toBeDefined();
    expect(mock.helloworld).toBeDefined();
    // We might find a workaround for this, but class fields are not easily accessible
    // contrary to class methods
    expect(mock.helloworld2).not.toBeDefined();
  });

  it("should default to a returned undefined", () => {
    const mock = Mockit.mock(Hellaw);
    expect(mock.hello()).toBeUndefined();
    expect(mock.world()).toBeUndefined();
    expect(mock.helloworld()).toBeUndefined();
  });

  it("should allow to change the default behaviour", async () => {
    const mock = Mockit.mock(Hellaw);
    Mockit.when(mock.hello).isCalled.thenReturn("hello");
    expect(mock.hello()).toBe("hello");

    Mockit.when(mock.world).isCalled.thenThrow(new Error("error"));
    expect(() => mock.world()).toThrowError("error");

    let counter = 0;
    Mockit.when(mock.helloworld).isCalled.thenCall(() => {
      counter++;
    });

    mock.helloworld();
    mock.helloworld();
    expect(counter).toBe(2);
    mock.helloworld();
    expect(counter).toBe(3);

    Mockit.when(mock.helloworld).isCalled.thenResolve("hello-resolved");
    expect(mock.helloworld()).resolves.toBe("hello-resolved");

    Mockit.when(mock.helloworld).isCalled.thenReject(
      new Error("error-rejected")
    );
    expect(mock.helloworld()).rejects.toThrowError("error-rejected");
  });
});
