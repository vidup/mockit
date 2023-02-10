import { Mockit } from "../../mockit";

function double(n: number) {
  return n * 2;
}

describe("Mockit > mockFunction stats", () => {
  test("it should return an empty list of calls", () => {
    const mock = Mockit.mockFunction(double);
    const spy = Mockit.spyFunction(mock);

    expect(spy.calls).toEqual([]);
  });

  test("it should register the calls", () => {
    const mock = Mockit.mockFunction(double);
    const spy = Mockit.spyFunction(mock);

    mock(1);
    mock(2);
    mock(3);

    expect(spy.calls.length).toBe(3);
  });

  it("should allow to clear the calls history", () => {
    const mock = Mockit.mockFunction(double);
    const spy = Mockit.spyFunction(mock);

    mock(1);
    mock(2);
    mock(3);

    expect(spy.calls.length).toBe(3);
    spy.clearCalls();

    expect(spy.calls).toEqual([]);
  });

  it("should remember which value was returned", () => {
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Return,
        returnedValue: 42,
      },
    });
    const spy = Mockit.spyFunction(mock);

    mock(1);

    expect(
      spy.calls[0].type === Mockit.Behaviours.Return &&
        spy.calls[0].returnedValue === 42
    ).toBe(true);
  });

  it("should remember which error was thrown", () => {
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Throw,
        error: new Error("Something went wrong"),
      },
    });
    const spy = Mockit.spyFunction(mock);

    try {
      mock(1);
    } catch (err) {
    } finally {
      expect(
        spy.calls[0].type === Mockit.Behaviours.Throw &&
          spy.calls[0].error.message === "Something went wrong"
      ).toBe(true);
    }
  });

  it("should remember which callback was called", () => {
    let counter = 0;
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Call,
        callback: () => {
          counter++;
        },
      },
    });

    const spy = Mockit.spyFunction(mock);

    mock(1);

    expect(counter).toBe(1);

    expect(
      spy.calls[0].type === Mockit.Behaviours.Call &&
        typeof spy.calls[0].callback === "function"
    ).toBe(true);

    if (spy.calls[0].type !== Mockit.Behaviours.Call)
      throw new Error("Invalid call type");
    spy.calls[0].callback();

    expect(counter).toBe(2);
  });

  it("should remember which value was resolved", async () => {
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Resolve,
        resolvedValue: 42,
      },
    });

    const spy = Mockit.spyFunction(mock);

    const result = await mock(1);

    expect(result).toBe(42);

    expect(
      spy.calls[0].type === Mockit.Behaviours.Resolve &&
        spy.calls[0].resolvedValue === 42
    ).toBe(true);
  });

  it("should remember which value was rejected", async () => {
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Reject,
        rejectedValue: new Error("Something went wrong"),
      },
    });

    const spy = Mockit.spyFunction(mock);

    try {
      await mock(1);
    } catch (err) {
    } finally {
      expect(
        spy.calls[0].type === Mockit.Behaviours.Reject &&
          spy.calls[0].rejectedValue.message === "Something went wrong"
      ).toBe(true);
    }
  });
});
