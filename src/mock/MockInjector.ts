import { Mock, Mock2 } from ".";
import { GetClassMethods } from "../types/GetClassMethods";

export class MockInjector<T> {
  private readonly mock: Mock<T>;
  constructor(mock: any) {
    this.mock = mock as Mock<T>;
  }

  public calls(func: GetClassMethods<T>, withArgs: any[]) {
    const mock = this.mock;
    return {
      thenReturn(returnValue: any) {
        mock.registerMock(func, withArgs, () => returnValue);
      },
      thenThrow(error: any extends Error ? Error : string) {
        mock.registerMock(func, withArgs, () => {
          throw error;
        });
      },
      thenCall(f: (...args: any[]) => any) {
        mock.registerMock(func, withArgs, () => {
          return f();
        });
      },
      thenResolve(returnValue: any) {
        mock.registerMock(func, withArgs, async () => {
          return returnValue;
        });
      },
      thenReject(error: any extends Error ? Error : string) {
        mock.registerMock(func, withArgs, async () => {
          throw error;
        });
      },
    };
  }
}

export class InjectorWrapper<T> {
  private readonly mock: Mock2<T>;
  constructor(mock: any) {
    this.mock = mock as Mock2<T>;
  }

  public calls(func: GetClassMethods<T>) {
    return new Injector(func, this.mock);
  }
}

export class Injector<T> {
  constructor(
    private readonly funcName: GetClassMethods<T>,
    private readonly mock: Mock2<T>
  ) {}
  public withArgs(...args: any[]) {
    const { mock, funcName } = this;
    return {
      thenReturn(returnValue: any) {
        mock.setupFunctionBehaviour({
          funcName,
          args,
          newBehaviour: () => returnValue,
        });
      },
    };
  }
}
