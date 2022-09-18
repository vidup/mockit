import { Mock } from "./mock";
import { MockInjector } from "./mock/MockInjector";
import { Spy } from "./mock/Spy";

export class Mockit {
  static mock<T extends any>(_clazz: T): T {
    return new Mock() as T;
  }

  static spy(mock) {
    return new Spy(mock);
  }

  static when(mock) {
    return new MockInjector(mock);
  }
}
