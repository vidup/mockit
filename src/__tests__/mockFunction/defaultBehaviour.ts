import { Mockit } from "../../mockit";
function double(n) {
  return n * 2;
}

describe("Mockit > function > default behaviour", () => {
  it("should return undefined by default", () => {
    const mock = Mockit.mockFunction(double);
    expect(mock(1)).toBe(undefined);
    expect(mock(2)).toBe(undefined);
    expect(mock(0)).toBe(undefined);
    expect(mock(-1)).toBe(undefined);
  });

  it("should be able to RETURN 42 by default", () => {
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Return,
        returnedValue: 42,
      },
    });

    expect(mock(1)).toBe(42);
    expect(mock(2)).toBe(42);
    expect(mock(0)).toBe(42);
    expect(mock(-1)).toBe(42);
  });

  it("should be able to THROW an error by default", () => {
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Throw,
        error: new Error("Something went wrong"),
      },
    });

    expect(() => mock(1)).toThrowError("Something went wrong");
    expect(() => mock(2)).toThrowError("Something went wrong");
    expect(() => mock(0)).toThrowError("Something went wrong");
    expect(() => mock(-1)).toThrowError("Something went wrong");
  });

  it("should be able to RESOLVE a value by default", () => {
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Resolve,
        resolvedValue: 42,
      },
    });

    expect(mock(1)).resolves.toBe(42);
    expect(mock(2)).resolves.toBe(42);
    expect(mock(0)).resolves.toBe(42);
    expect(mock(-1)).resolves.toBe(42);
  });

  it("should be able to REJECT a value by default", () => {
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Reject,
        rejectedValue: 42,
      },
    });

    expect(mock(1)).rejects.toBe(42);
    expect(mock(2)).rejects.toBe(42);
    expect(mock(0)).rejects.toBe(42);
    expect(mock(-1)).rejects.toBe(42);
  });

  it("should be able to CALL a callback by default", () => {
    let counter = 0;
    const mock = Mockit.mockFunction(double, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Call,
        callback: () => counter++,
      },
    });

    expect(counter).toBe(0);

    expect(mock(1)).toBe(0);
    expect(mock(2)).toBe(1);
    expect(mock(0)).toBe(2);
    expect(mock(-1)).toBe(3);

    expect(counter).toBe(4);
  });
});
