import { z } from "zod";
import { Behaviour } from "../types/behaviour";
import { GetClassMethods } from "../types/GetClassMethods";
import { FunctionMock, FunctionMockUtils } from "./functionMock";

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

  static spyFunction<T extends (...args: any[]) => any>(original: T) {
    const utils = new FunctionMockUtils(original);
    return utils.spy();
  }
}

class AbstractMock<T> {
  // private data = {};
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
