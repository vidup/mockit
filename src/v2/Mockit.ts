import { z } from "zod";
import { Behaviour } from "../types/behaviour";

import { AbstractClassMock } from "./classMocks/abstract";
import { ConcreteClassMock } from "./classMocks/concrete";

import { FunctionMock } from "./functionMock";
import { FunctionMockUtils } from "./functionMock/utils";

import { FunctionSpy } from "./functionSpy";

type AbstractClass<T> = abstract new (...args: any[]) => T;
export type Class<T> = new (...args: any[]) => T;

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
    return new AbstractClassMock<T>(propertiesToMock) as T;
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
    return new ConcreteClassMock<T>(_original) as T;
  }

  static mockFunction<T extends (...args: any[]) => any>(original: T): T {
    return FunctionMock(original.name) as T;
  }

  static spy<T extends (...args: any[]) => any>(mockedFunctionInstance: T) {
    // Here, you should provide a FunctionMock instance, not a real function
    // This generic type is here to make it look like it accepts a real function
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
