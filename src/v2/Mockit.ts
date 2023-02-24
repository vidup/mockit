import { Behaviour } from "../types/behaviour";
import {
  changeDefaultBehaviour,
  FunctionMock,
  FunctionMockUtils,
} from "./functionMock";

type AbstractClass<T> = abstract new (...args: any[]) => T;
type Class<T> = new (...args: any[]) => T;

export class Mockit {
  /**
   * @param original abstract class to mock
   * @param propertiesToMock list of properties that
   * will be mocked. If not provided, all properties
   * will be undefined.
   * It's required because we cannot dynamically access abstract properties.
   * (they're not compiled in the JS code)
   */
  static mockAbstract<T>(
    original: AbstractClass<T>,
    propertiesToMock: Array<keyof T>
  ): T {
    return new Mock<T>(propertiesToMock) as T;
  }

  static whenMethod<T>(method: any) {
    return {
      /**
       * This function sets up the behaviour of the mocked method.
       * If the mocked method is called with parameters that are not setup for custom behaviour, this will be the default behaviour
       */
      get isCalled() {
        const utils = new FunctionMockUtils(method);
        return {
          /**
           * @param value value to return when the method is called
           */
          thenReturn(value: any) {
            utils.changeDefaultBehaviour({
              behaviour: Behaviour.Return,
              returnedValue: value,
            });
          },
          /**
           * @param error error to throw when the method is called
           */
          thenThrow(error: Error) {
            utils.changeDefaultBehaviour({
              behaviour: Behaviour.Throw,
              error,
            });
          },
          /**
           * @param value value to resolve when the method is called
           */
          thenResolve(value: any) {
            utils.changeDefaultBehaviour({
              behaviour: Behaviour.Resolve,
              resolvedValue: value,
            });
          },
          /**
           * @param error error to reject when the method is called
           */
          thenReject(error: Error) {
            utils.changeDefaultBehaviour({
              behaviour: Behaviour.Reject,
              rejectedValue: error,
            });
          },
          /**
           * @param callback callback to call when the method is called
           */
          thenCall(callback: (...args: any[]) => any) {
            utils.changeDefaultBehaviour({
              behaviour: Behaviour.Call,
              callback,
            });
          },
        };
      },
    };
  }
}

class Mock<T> {
  // private data = {};
  constructor(propertiesToMock: Array<keyof T>) {
    for (const property of propertiesToMock) {
      const fMock = FunctionMock(property as string);
      this[property as string] = fMock;
    }
  }
}
