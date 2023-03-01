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
    let fake = () => {};

    return new Proxy(fake, {
      get: (target, prop) => {
        if (prop === "calls") {
          return Reflect.get(target, "calls");
        }
      },
      apply: function (target, _thisArg, argumentsList) {
        if (options?.defaultBehaviour?.behaviour === Behaviour.Throw) {
          Reflect.set(target, "calls", [
            ...((Reflect.get(target, "calls") as any[]) ?? []),
            {
              args: argumentsList,
              error: options.defaultBehaviour.error,
              type: Behaviour.Throw,
            },
          ]);
          throw options.defaultBehaviour.error;
        }

        if (options?.defaultBehaviour?.behaviour === Behaviour.Return) {
          Reflect.set(target, "calls", [
            ...((Reflect.get(target, "calls") as any[]) ?? []),
            {
              args: argumentsList,
              returnedValue: options.defaultBehaviour.returnedValue,
              type: Behaviour.Return,
            },
          ]);

          return options.defaultBehaviour.returnedValue;
        }

        if (options?.defaultBehaviour?.behaviour === Behaviour.Reject) {
          Reflect.set(target, "calls", [
            ...((Reflect.get(target, "calls") as any[]) ?? []),
            {
              args: argumentsList,
              rejectedValue: options.defaultBehaviour.rejectedValue,
              type: Behaviour.Reject,
            },
          ]);

          return Promise.reject(options.defaultBehaviour.rejectedValue);
        }

        if (options?.defaultBehaviour?.behaviour === Behaviour.Resolve) {
          Reflect.set(target, "calls", [
            ...((Reflect.get(target, "calls") as any[]) ?? []),
            {
              args: argumentsList,
              resolvedValue: options.defaultBehaviour.resolvedValue,
              type: Behaviour.Resolve,
            },
          ]);
          return Promise.resolve(options.defaultBehaviour.resolvedValue);
        }

        if (options?.defaultBehaviour?.behaviour === Behaviour.Call) {
          Reflect.set(target, "calls", [
            ...((Reflect.get(target, "calls") as any[]) ?? []),
            {
              args: argumentsList,
              callback: options.defaultBehaviour.callback,
              type: Behaviour.Call,
            },
          ]);
          return options.defaultBehaviour.callback(...argumentsList);
        }

        Reflect.set(target, "calls", [
          ...((Reflect.get(target, "calls") as any[]) ?? []),
          {
            args: argumentsList,
            returnedValue: undefined,
            type: Behaviour.Return,
          },
        ]);

        return undefined;
      },
    }) as T;
  }

  static spyFunction<T extends (...args: any[]) => any>(mock: T) {
    return {
      get calls() {
        return (Reflect.get(mock, "calls") ?? []) as FunctionCall[];
      },
      clearCalls() {
        Reflect.set(mock, "calls", []);
      },
    };
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

type FunctionCall =
  | { type: Behaviour.Return; args: any[]; returnedValue: any }
  | { type: Behaviour.Throw; args: any[]; error: Error }
  | { type: Behaviour.Resolve; args: any[]; resolvedValue: any }
  | { type: Behaviour.Reject; args: any[]; rejectedValue: any }
  | { type: Behaviour.Call; args: any[]; callback: (...args: any[]) => any };

export { Mockit as MockitV2 } from "./v2/Mockit";
