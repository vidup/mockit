import { Mock } from "./mock";

import { Behaviour, NewBehaviourParam } from "./types/behaviour";
import { AnyClass } from "./types/AnyClass";

import { Spy } from "./mock/Spy";
import { Any } from "./Any";

import { InjectorWrapper } from "./mock/InjectorWrapper";

type MockOptions = {
  defaultBehaviour?: NewBehaviourParam;
};

export class Mockit {
  static mock<T>(original: AnyClass<T>, options?: MockOptions): T {
    const mock = new Mock<T>(original);
    mock.setupBehaviour(
      options?.defaultBehaviour ?? {
        behaviour: Behaviour.Return,
        returnedValue: undefined,
      }
    );

    return mock as T;
  }

  static mockFunction<T extends (...args: any[]) => any>(
    _original: T,
    options?: MockOptions
  ): T {
    return new Proxy(() => {}, {
      apply: function (_target, _thisArg, argumentsList) {
        if (options?.defaultBehaviour?.behaviour === Behaviour.Throw) {
          throw options.defaultBehaviour.error;
        }

        if (options?.defaultBehaviour?.behaviour === Behaviour.Return) {
          return options.defaultBehaviour.returnedValue;
        }

        if (options?.defaultBehaviour?.behaviour === Behaviour.Reject) {
          return Promise.reject(options.defaultBehaviour.rejectedValue);
        }

        if (options?.defaultBehaviour?.behaviour === Behaviour.Resolve) {
          return Promise.resolve(options.defaultBehaviour.resolvedValue);
        }

        if (options?.defaultBehaviour?.behaviour === Behaviour.Call) {
          return options.defaultBehaviour.callback(...argumentsList);
        }

        return undefined;
      },
    }) as T;
  }

  static changeDefaultBehaviour<T>(mock: T, newBehaviour: NewBehaviourParam) {
    (mock as Mock<T>).setupBehaviour(newBehaviour);
  }

  static spy<T>(mock: T) {
    return new Spy<T>(mock as Mock<T>);
  }

  static when<T>(mock: T) {
    return new InjectorWrapper<T>(mock as Mock<T>);
  }

  static any(val: String | Object | Number | Boolean) {
    return new Any(val);
  }

  static Behaviours = Behaviour;
}
