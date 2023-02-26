import { z } from "zod";
import { argsContainZodSchema } from "./functionSpy";

describe("argsContainZodSchema", () => {
  const notZodSchema = [
    1,
    "hello",
    true,
    null,
    undefined,
    {},
    [],
    () => {},
    new Date(),
    new Error(),
    new Map(),
    new Set(),
    new WeakMap(),
    new WeakSet(),
    Symbol("hello"),
    BigInt(1),
    new Promise(() => {}),
    new ArrayBuffer(1),
    new Int8Array(1),
    new Uint8Array(1),
    new Uint8ClampedArray(1),
    new Int16Array(1),
    new Uint16Array(1),
    new Int32Array(1),
    new Uint32Array(1),
    new Float32Array(1),
    new Float64Array(1),
    new BigInt64Array(1),
  ];

  it("should return false if the argument is not a zod schema", () => {
    notZodSchema.forEach((arg) => {
      expect(argsContainZodSchema([arg])).toBe(false);
    });
  });

  it("should return true if the argument is a zod schema", () => {
    const zodSchemas = [
      z.string(),
      z.number(),
      z.boolean(),
      z.function(),
      z.string().uuid(),
      z.bigint(),
      z.map(z.any(), z.any()),
      z.set(z.any()),
      z.array(z.any()),
      z.tuple([z.any(), z.any()]),
      z.record(z.any()),
    ];

    zodSchemas.forEach((arg) => {
      expect(argsContainZodSchema(arg)).toBe(true);
    });
  });
});
