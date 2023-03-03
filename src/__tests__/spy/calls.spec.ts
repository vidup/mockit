import { Mockit } from "../../mockit";

function hello(...args: any[]) {
  return "world";
}

describe("v2 stats", () => {
  it("should return an empty array when no calls are made", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.calls).toEqual([]);
  });

  it("should return an array with one call when one call is made", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    mock("hello");

    expect(spy.calls.length).toBe(1);
    expect(spy.calls[0].args).toEqual(["hello"]);
    expect(spy.calls[0].behaviour).toEqual({
      behaviour: Mockit.Behaviours.Return,
      returnedValue: undefined,
    });
  });

  it("should cumulate calls", async () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    mock("hello");
    mock("hello");
    mock("hello");

    expect(spy.calls.length).toBe(3);

    let counter = 0;
    Mockit.when(mock)
      .isCalledWith("hiiii")
      .thenCall(() => counter++);

    mock("hiiii");
    expect(spy.calls.length).toBe(4);
    expect(spy.calls[3].args).toEqual(["hiiii"]);
    expect(spy.calls[3].behaviour).toEqual({
      behaviour: Mockit.Behaviours.Call,
      callback: expect.any(Function),
    });

    expect(counter).toBe(1);

    if (spy.calls[3].behaviour.behaviour === Mockit.Behaviours.Call) {
      spy.calls[3].behaviour.callback();
    } else {
      throw new Error("Invalid behaviour");
    }

    expect(counter).toBe(2);
  });
});
