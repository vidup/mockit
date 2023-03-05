import { z } from "zod";
import { Mockit } from "../../../mockit";

function hello(...args: any[]) {
  return args;
}

describe("Spy: zod schemas", () => {
  it("should work for any string", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.string()).atLeastOnce).toBe(false);
    mock(1);
    expect(spy.wasCalledWith(z.string()).atLeastOnce).toBe(false);

    mock("hello");
    expect(spy.wasCalledWith(z.string()).atLeastOnce).toBe(true);
  });

  it("should work for any number", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.number()).atLeastOnce).toBe(false);
    mock("1");
    expect(spy.wasCalledWith(z.number()).atLeastOnce).toBe(false);

    mock(1);
    expect(spy.wasCalledWith(z.number()).atLeastOnce).toBe(true);
  });

  it("should work for any boolean", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.boolean()).atLeastOnce).toBe(false);
    mock(0);
    expect(spy.wasCalledWith(z.boolean()).atLeastOnce).toBe(false);

    mock(true);
    expect(spy.wasCalledWith(z.boolean()).atLeastOnce).toBe(true);
  });

  it("should work with object", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.object({})).atLeastOnce).toBe(false);
    mock([]);
    expect(spy.wasCalledWith(z.object({})).atLeastOnce).toBe(false);

    mock({});
    expect(spy.wasCalledWith(z.object({})).atLeastOnce).toBe(true);
  });

  it("should work with a date", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.date()).atLeastOnce).toBe(false);
    mock("not a date");
    expect(spy.wasCalledWith(z.date()).atLeastOnce).toBe(false);

    mock(new Date());
    expect(spy.wasCalledWith(z.date()).atLeastOnce).toBe(true);
  });

  it("should work with a function", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.function()).atLeastOnce).toBe(false);
    mock("not a function");
    expect(spy.wasCalledWith(z.function()).atLeastOnce).toBe(false);

    mock(() => {});
    expect(spy.wasCalledWith(z.function()).atLeastOnce).toBe(true);
  });

  it("should work with any Map", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.map(z.any(), z.any())).atLeastOnce).toBe(false);
    mock(new Set());
    expect(spy.wasCalledWith(z.map(z.any(), z.any())).atLeastOnce).toBe(false);

    mock(new Map());
    expect(spy.wasCalledWith(z.map(z.any(), z.any())).atLeastOnce).toBe(true);
  });

  it("should work with any Set", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.set(z.any())).atLeastOnce).toBe(false);
    mock(new Map());
    expect(spy.wasCalledWith(z.set(z.any())).atLeastOnce).toBe(false);
    mock(new Set());
    expect(spy.wasCalledWith(z.set(z.any())).atLeastOnce).toBe(true);
  });

  it("should work with any Array", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.array(z.any())).atLeastOnce).toBe(false);
    mock({});
    expect(spy.wasCalledWith(z.array(z.any())).atLeastOnce).toBe(false);

    mock([]);
    expect(spy.wasCalledWith(z.array(z.any())).atLeastOnce).toBe(true);
  });

  it("should work with any email", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.string().email()).atLeastOnce).toBe(false);
    mock("not an email");
    expect(spy.wasCalledWith(z.string().email()).atLeastOnce).toBe(false);

    mock("victor@skillup.co");
    expect(spy.wasCalledWith(z.string().email()).atLeastOnce).toBe(true);
  });

  it("should work with any url", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.string().url()).atLeastOnce).toBe(false);
    mock("not a url");
    expect(spy.wasCalledWith(z.string().url()).atLeastOnce).toBe(false);

    mock("https://skillup.co");
    expect(spy.wasCalledWith(z.string().url()).atLeastOnce).toBe(true);
  });

  it("should work with any uuid", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(spy.wasCalledWith(z.string().uuid()).atLeastOnce).toBe(false);
    mock("not a uuid");
    expect(spy.wasCalledWith(z.string().uuid()).atLeastOnce).toBe(false);

    mock("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    expect(spy.wasCalledWith(z.string().uuid()).atLeastOnce).toBe(true);
  });
});
