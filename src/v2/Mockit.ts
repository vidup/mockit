import { FunctionMock, FunctionMockUtils } from "./functionMock";

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
    _original: AbstractClass<T>, // it's here to activate the generic type
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
        return utils.defaultBehaviourController();
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
