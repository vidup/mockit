import { z } from "zod";

import { FunctionMock } from "../internal/functionMock";

import { type Class } from "./types";
import { type GetClassMethods } from "./GetClassMethods";

const functionSchema = z.function();

export class ConcreteClassMock<T> {
  constructor(original: Class<T>) {
    const properties = Object.getOwnPropertyNames(
      original.prototype
    ) as GetClassMethods<T>[];

    const instance = new original();
    const methods = properties.filter(
      (method) =>
        method !== "constructor" &&
        functionSchema.safeParse(instance[method]).success
    );

    for (const method of methods) {
      const fMock = FunctionMock(method as string);
      this[method as string] = fMock;
    }
  }
}
