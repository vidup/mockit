import { Mock } from "./mock";
import { MockInjector } from "./mock/MockInjector";
import { Copy } from "./mock/Copy";
import { Spy } from "./mock/Spy";

export class Mockit {
  static mock<T extends any>(_clazz: T): T {
    return new Mock() as T;
  }

  static spy<T>(mock) {
    return new Spy<T>(mock);
  }

  static when<T>(mock) {
    return new MockInjector(mock);
  }

  static stub<T>(original: new () => T) {
    return new Copy(original) as T;
  }
}
