import { z } from "zod";

import {
  Behaviour,
  FunctionMock,
  FunctionMockUtils,
  FunctionSpy,
} from "./internal";

import {
  AbstractClassMock,
  ConcreteClassMock,
  InterfaceClassMock,
  type AbstractClass,
  type Class,
} from "./classMocks";

import { suppose } from "./suppose";
import { verify } from "./suppose/verify";

export function mockAbstract<T>(
  _original: AbstractClass<T>, // it's here to activate the generic type
  propertiesToMock: Array<keyof T>
): T {
  return new AbstractClassMock<T>(propertiesToMock) as T;
}

export function mock<T>(_original: Class<T>): T {
  return new ConcreteClassMock<T>(_original) as T;
}

export function mockFunction<T extends (...args: any[]) => any>(
  original: T
): T {
  return FunctionMock(original.name) as T;
}

export function mockInterface<T>(...functionsToMock: Array<keyof T>): T {
  const mock = new InterfaceClassMock(functionsToMock as string[]);
  return mock as T;
}

export function when<T>(method: any) {
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

export { suppose, verify };
export { Behaviour };

export function spy<T extends (...args: any[]) => any>(
  mockedFunctionInstance: T
) {
  // Here, you should provide a FunctionMock instance, not a real function
  // This generic type is here to make it look like it accepts a real function
  return new FunctionSpy(mockedFunctionInstance);
}

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
    return mockAbstract(_original, propertiesToMock);
  }

  static when<T>(method: any) {
    return when(method);
  }

  static mock<T>(_original: Class<T>): T {
    return mock(_original);
  }

  static mockInterface<T>(...functionsToMock: Array<keyof T>): T {
    return mockInterface(...functionsToMock);
  }

  static mockFunction<T extends (...args: any[]) => any>(original: T): T {
    return mockFunction(original);
  }

  static spy<T extends (...args: any[]) => any>(mockedFunctionInstance: T) {
    // Here, you should provide a FunctionMock instance, not a real function
    // This generic type is here to make it look like it accepts a real function
    return spy(mockedFunctionInstance);
  }

  static suppose = suppose;
  static verify = verify;

  static get any() {
    // this is just a port to zod, you can pass zod schemas directly
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
