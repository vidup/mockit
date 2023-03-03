import { Mockit } from "../../../mockit";

function hello(...args: any[]) {
  return args;
}

describe("v2 spies with any arguments", () => {
  it("should work for any string", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.string).atLeastOnce).toBe(
      false
    );
    mock(1);
    expect(spy.hasBeenCalled.withArgs(Mockit.any.string).atLeastOnce).toBe(
      false
    );

    mock("hello");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.string).atLeastOnce).toBe(
      true
    );
  });

  it("should work for any number", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.number).atLeastOnce).toBe(
      false
    );
    mock("1");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.number).atLeastOnce).toBe(
      false
    );

    mock(1);
    expect(spy.hasBeenCalled.withArgs(Mockit.any.number).atLeastOnce).toBe(
      true
    );
  });

  it("should work for any boolean", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.boolean).atLeastOnce).toBe(
      false
    );
    mock(0);
    expect(spy.hasBeenCalled.withArgs(Mockit.any.boolean).atLeastOnce).toBe(
      false
    );

    mock(true);
    expect(spy.hasBeenCalled.withArgs(Mockit.any.boolean).atLeastOnce).toBe(
      true
    );
  });

  it("should work with object", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.object).atLeastOnce).toBe(
      false
    );
    mock([]);
    expect(spy.hasBeenCalled.withArgs(Mockit.any.object).atLeastOnce).toBe(
      false
    );

    mock({});
    expect(spy.hasBeenCalled.withArgs(Mockit.any.object).atLeastOnce).toBe(
      true
    );
  });

  it("should work with a date", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.date).atLeastOnce).toBe(false);
    mock("not a date");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.date).atLeastOnce).toBe(false);

    mock(new Date());
    expect(spy.hasBeenCalled.withArgs(Mockit.any.date).atLeastOnce).toBe(true);
  });

  it("should work with a function", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.function).atLeastOnce).toBe(
      false
    );
    mock("not a function");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.function).atLeastOnce).toBe(
      false
    );

    mock(() => {});
    expect(spy.hasBeenCalled.withArgs(Mockit.any.function).atLeastOnce).toBe(
      true
    );
  });

  it("should work with any Map", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.map).atLeastOnce).toBe(false);
    mock(new Set());
    expect(spy.hasBeenCalled.withArgs(Mockit.any.map).atLeastOnce).toBe(false);

    mock(new Map());
    expect(spy.hasBeenCalled.withArgs(Mockit.any.map).atLeastOnce).toBe(true);
  });

  it("should work with any Set", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.set).atLeastOnce).toBe(false);
    mock(new Map());
    expect(spy.hasBeenCalled.withArgs(Mockit.any.set).atLeastOnce).toBe(false);
    mock(new Set());
    expect(spy.hasBeenCalled.withArgs(Mockit.any.set).atLeastOnce).toBe(true);
  });

  it("should work with any Array", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.array).atLeastOnce).toBe(
      false
    );
    mock({});
    expect(spy.hasBeenCalled.withArgs(Mockit.any.array).atLeastOnce).toBe(
      false
    );

    mock([]);
    expect(spy.hasBeenCalled.withArgs(Mockit.any.array).atLeastOnce).toBe(true);
  });

  it("should work with any email", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.email).atLeastOnce).toBe(
      false
    );
    mock("not an email");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.email).atLeastOnce).toBe(
      false
    );

    mock("victor@skillup.co");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.email).atLeastOnce).toBe(true);
  });

  it("should work with any url", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.url).atLeastOnce).toBe(false);
    mock("not a url");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.url).atLeastOnce).toBe(false);

    mock("https://skillup.co");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.url).atLeastOnce).toBe(true);
  });

  it("should work with any uuid", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.hasBeenCalled.withArgs(Mockit.any.uuid).atLeastOnce).toBe(false);
    mock("not a uuid");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.uuid).atLeastOnce).toBe(false);

    mock("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    expect(spy.hasBeenCalled.withArgs(Mockit.any.uuid).atLeastOnce).toBe(true);
  });
});
