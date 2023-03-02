import { z } from "zod";

import { GetClassMethods } from "../../types/GetClassMethods";
import { FunctionMock } from "../functionMock";
import { Class } from "../Mockit";

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
