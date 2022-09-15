class Mock {
  private callsMap: Map<string, any> = new Map();
  constructor() {}

  registerMock(
    functionName: string,
    args: any[],
    whatToDo: (...args: any[]) => any
  ) {
    if (!this.callsMap.get(functionName)) {
      this.callsMap.set(functionName, new Map());
    }

    const funcMockMap = this.callsMap.get(functionName);
    funcMockMap.set(this.parseArgs(args), whatToDo);

    this.callsMap.set(functionName, funcMockMap);

    this.refreshMockFunction(functionName);
  }

  private parseArgs(args: any[]) {
    // todo: for objects we should use a hash or order the keys alphabetically
    return args.map((arg) => JSON.stringify(arg)).join(",");
  }

  public refreshMockFunction(name: string) {
    this[name] = (...args: any[]) => {
      const key = this.parseArgs(args);
      const mockedFunction = this.callsMap.get(name);
      if (!mockedFunction) {
        throw new Error(`Function ${name} is not mocked`);
      }

      const mockedBehaviour = mockedFunction.get(key);
      if (!mockedBehaviour) {
        throw new Error(`Function ${name} is not mocked with args ${key}`);
      }

      return mockedBehaviour(...args);
    };
  }
}

export class Mockit {
  static mock<T extends any>(_clazz: T): T {
    return new Mock() as T;
  }

  static when(mock) {
    return {
      calls(func: string, withArgs: any[]) {
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
      },
    };
  }
}
