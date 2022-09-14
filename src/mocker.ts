class Mock {
  private calls: Record<string, any> = {};
  //   private calls: {
  //     key: string;
  //     whatToDo: (...args: any[]) => any;
  //   }[] = [];

  private callsMap: Map<string, any> = new Map();
  constructor() {}

  registerMock(
    functionName: string,
    args: any[],
    whatToDo: (...args: any[]) => any
  ) {
    if (!this.calls[functionName]) {
      this.calls[functionName] = {};
      this.callsMap.set(functionName, new Map());
    }

    this.calls[functionName][this.parseArgs(args)] = whatToDo;

    const funcMockMap = this.callsMap.get(functionName);
    funcMockMap.set(this.parseArgs(args), whatToDo);

    this.callsMap.set(functionName, funcMockMap);

    this.refreshMockFunction(functionName);
  }

  private parseArgs(args: any[]) {
    return args.map((arg) => JSON.stringify(arg)).join(",");
  }

  public refreshMockFunction(name: string) {
    this[name] = (...args: any[]) => {
      const key = this.parseArgs(args);
      const mockedFunction = this.calls[name][key];
      if (mockedFunction) {
        return mockedFunction(...args);
      } else {
        throw new Error(
          `No mocked function found for ${name} with args ${args}`
        );
        // should i do nothing ?
      }
    };
  }
}

export class Mockit {
  constructor() {}

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
        };
      },
    };
  }
}
