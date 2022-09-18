import { Mock } from "./mock";
import { MockInjector } from "./mock/MockInjector";
import { Copy } from "./mock/Copy";
import { Spy } from "./mock/Spy";

export class Mockit {
  static mock<T>(_clazz: T): T {
    return new Mock<T>() as T;
  }

  static spy<T>(mock: T) {
    return new Spy<T>(mock as Mock<T>);
  }

  static when<T>(mock: T) {
    return new MockInjector<T>(mock as Mock<T>);
  }

  static stub<T>(original: new () => T) {
    return new Copy(original) as T;
  }
}
