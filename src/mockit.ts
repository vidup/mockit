import { Mock, Mock2 } from "./mock";
import { MockInjector, InjectorWrapper } from "./mock/MockInjector";
import { Behaviour, Copy, NewBehaviourParam } from "./mock/Copy";
import { Spy } from "./mock/Spy";
import { Any } from "./Any";

type MockOptions = {
  defaultBehaviour?: NewBehaviourParam;
};

export class Mockit {
  static mock<T>(_original: new () => T): T {
    return new Mock<T>() as T;
  }

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

  static spy<T>(mock: T) {
    return new Spy<T>(mock as Mock<T>);
  }

  static when<T>(mock: T) {
    return new MockInjector<T>(mock as Mock<T>);
  }

  static when2<T>(mock: T) {
    return new InjectorWrapper<T>(mock as Mock2<T>);
  }

  static stub<T>(original: new () => T) {
    return new Copy(original) as T;
  }

  static stubThatThrows<T>(original: new () => T, threwValue: any) {
    return new Copy(original).setupBehaviour({
      behaviour: Behaviour.Throw,
      error: threwValue,
    }) as T;
  }

  static stubThatReturns<T>(original: new () => T, returnedValue: any) {
    return new Copy(original).setupBehaviour({
      behaviour: Behaviour.Return,
      returnedValue,
    }) as T;
  }

  static stubThatResolves<T>(original: new () => T, resolvedValue: any) {
    return new Copy(original).setupBehaviour({
      behaviour: Behaviour.Resolve,
      resolvedValue,
    }) as T;
  }

  static stubThatRejects<T>(original: new () => T, rejectedValue: any) {
    return new Copy(original).setupBehaviour({
      behaviour: Behaviour.Reject,
      rejectedValue,
    }) as T;
  }

  static stubThatCallsSomething<T>(
    original: new () => T,
    callback: (...args: any[]) => any
  ) {
    return new Copy(original).setupBehaviour({
      behaviour: Behaviour.Call,
      callback,
    }) as T;
  }

  static any(val: String | Object | Number | Boolean) {
    return new Any(val);
  }

  static Behaviours = Behaviour;
}
