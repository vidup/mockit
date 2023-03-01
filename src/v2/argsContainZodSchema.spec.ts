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
      z.object({ x: z.any(), y: z.number() }),
    ];

    zodSchemas.forEach((arg) => {
      expect(argsContainZodSchema(arg)).toBe(true);
    });
  });

  it("should do it with multiple arguments too", () => {
    const argsCombinations = [
      [1, "hello", z.string()],
      [1, "hello", z.number()],
      [1, "hello", z.boolean()],
      [z.string(), z.number(), z.boolean()],
      [z.string(), 1, z.boolean()],
      ["hello", { x: 1 }, z.object({ x: z.number() })],
    ];

    argsCombinations.forEach((args) => {
      expect(argsContainZodSchema(...args)).toBe(true);
    });
  });

  it("should be able to find deep zod schemas in objects", () => {
    const argsCombinations = [
      [{ x: 1, y: z.number() }],
      [{ x: 1, y: [z.number()] }],
      [{ x: { y: { z: z.number() } } }],
      [[[[[[[[z.number()]]]]]]]],
    ];

    argsCombinations.forEach((args) => {
      expect(argsContainZodSchema(...args)).toBe(true);
    });
  });
});
