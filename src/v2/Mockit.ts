import { z } from "zod";
import { Behaviour } from "../types/behaviour";
import { GetClassMethods } from "../types/GetClassMethods";
import { FunctionMock, FunctionMockUtils } from "./functionMock";
import { FunctionSpy } from "./functionSpy";

type AbstractClass<T> = abstract new (...args: any[]) => T;
type Class<T> = new (...args: any[]) => T;

export class Mockit {
  static Behaviours = Behaviour;

  /**
   * @param original abstract class to mock
   * @param propertiesToMock list of properties that
   * will be mocked. If not provided, all properties
   * will be undefined.
   * It's required because we cannot dynamically access abstract properties.
   * (they're not compiled in the JS code)
   */
  static mockAbstract<T>(
    _original: AbstractClass<T>, // it's here to activate the generic type
    propertiesToMock: Array<keyof T>
  ): T {
    return new AbstractMock<T>(propertiesToMock) as T;
  }

  static whenMethod<T>(method: any) {
    return {
      /**
       * This function sets up the behaviour of the mocked method.
       * If the mocked method is called with parameters that are not setup for custom behaviour, this will be the default behaviour
       */
      get isCalled() {
        const utils = new FunctionMockUtils(method);
        return utils.defaultBehaviourController();
      },
      isCalledWith(...args: any[]) {
        const utils = new FunctionMockUtils(method);
        return utils.callController(...args);
      },
    };
  }

  static mock<T>(_original: Class<T>): T {
    return new Mock<T>(_original) as T;
  }

  static mockFunction<T extends (...args: any[]) => any>(original: T): T {
    return FunctionMock(original.name) as T;
  }

  static spy<T extends (...args: any[]) => any>(mockedFunctionInstance: T) {
    // Here, you should provide a FunctionMock instance, not a real function
    // This generic type is here to make it look like a real function
    return new FunctionSpy(mockedFunctionInstance);
  }

  static get any() {
    return {
      string: z.string(),
      number: z.number(),
      boolean: z.boolean(),
      array: z.array(z.any()),
      object: z.object({}),
      function: z.function(),
      uuid: z.string().uuid(),
      date: z.date(),
      email: z.string().email(),
      url: z.string().url(),
      map: z.map(z.any(), z.any()),
      set: z.set(z.any()),
      bigint: z.bigint(),
    };
  }
}

class AbstractMock<T> {
  constructor(propertiesToMock: Array<keyof T>) {
    for (const property of propertiesToMock) {
      const fMock = FunctionMock(property as string);
      this[property as string] = fMock;
    }
  }
}

const functionSchema = z.function();

class Mock<T> {
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

// Mockit.any => use zod
// Save the arguments in the list of calls
// Then, if asked for a list of calls or anything with any parameters,
// Instead of using the classic hashing map, get the whole list of calls
// Then apply the filter on the list of calls

// The tough part will be to make it work at the same time as other arguments
// that are not any but are specific values
