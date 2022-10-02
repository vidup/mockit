import { Mock } from "./mock";

import { Behaviour, NewBehaviourParam } from "./types/behaviour";
import { Spy } from "./mock/Spy";
import { Any } from "./Any";

import { InjectorWrapper } from "./mock/InjectorWrapper";

type MockOptions = {
  defaultBehaviour?: NewBehaviourParam;
};

export class Mockit {
  static mock<T>(original: new () => T, options?: MockOptions): T {
    const mock = new Mock<T>(original);
    mock.setupBehaviour(
      options?.defaultBehaviour ?? {
        behaviour: Behaviour.Return,
        returnedValue: undefined,
      }
    );

    return mock as T;
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
