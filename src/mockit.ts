import { Mock2 } from "./mock2";

import { Behaviour, NewBehaviourParam } from "./types/behaviour";
import { Spy2 } from "./mock2/Spy";
import { Any } from "./Any";

import { InjectorWrapper } from "./mock2/InjectorWrapper";

type MockOptions = {
  defaultBehaviour?: NewBehaviourParam;
};

export class Mockit {
  static mock2<T>(original: new () => T, options?: MockOptions): T {
    const mock = new Mock2<T>(original);
    mock.setupBehaviour(
      options?.defaultBehaviour ?? {
        behaviour: Behaviour.Return,
        returnedValue: undefined,
      }
    );

    return mock as T;
  }

  static changeDefaultBehaviour<T>(mock: T, newBehaviour: NewBehaviourParam) {
    (mock as Mock2<T>).setupBehaviour(newBehaviour);
  }

  static spy2<T>(mock: T) {
    return new Spy2<T>(mock as Mock2<T>);
  }

  static when2<T>(mock: T) {
    return new InjectorWrapper<T>(mock as Mock2<T>);
  }

  static any(val: String | Object | Number | Boolean) {
    return new Any(val);
  }

  static Behaviours = Behaviour;
}
