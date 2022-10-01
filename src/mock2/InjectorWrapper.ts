import { Mock2 } from "./index";
import { GetClassMethods } from "../types/GetClassMethods";

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

      thenThrow(error: any) {
        mock.setupFunctionBehaviour({
          funcName,
          args,
          newBehaviour: () => {
            throw error;
          },
        });
      },

      thenResolve(resolvedValue: any) {
        mock.setupFunctionBehaviour({
          funcName,
          args,
          newBehaviour: () => Promise.resolve(resolvedValue),
        });
      },

      thenReject(rejectedValue: any) {
        mock.setupFunctionBehaviour({
          funcName,
          args,
          newBehaviour: () => Promise.reject(rejectedValue),
        });
      },

      thenCall(f: (...args: any[]) => any) {
        mock.setupFunctionBehaviour({
          funcName,
          args,
          newBehaviour: () => f(),
        });
      },
    };
  }

  public thenReturn(returnValue: any) {
    this.mock.setupFunctionBehaviour({
      funcName: this.funcName,
      newBehaviour: () => returnValue,
    });
  }

  public thenThrow(error: any) {
    this.mock.setupFunctionBehaviour({
      funcName: this.funcName,
      newBehaviour: () => {
        throw error;
      },
    });
  }

  public thenResolve(resolvedValue: any) {
    this.mock.setupFunctionBehaviour({
      funcName: this.funcName,
      newBehaviour: () => Promise.resolve(resolvedValue),
    });
  }

  public thenReject(rejectedValue: any) {
    this.mock.setupFunctionBehaviour({
      funcName: this.funcName,
      newBehaviour: () => Promise.reject(rejectedValue),
    });
  }

  public thenCall(f: (...args: any[]) => any) {
    this.mock.setupFunctionBehaviour({
      funcName: this.funcName,
      newBehaviour: () => f(),
    });
  }
}
