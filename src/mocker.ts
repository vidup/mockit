type Call = {
  args: any[];
  key: string;
  date: string;
};

class Mock {
  private callsMap: Map<string, any> = new Map();
  constructor() {}

  registerMock(
    functionName: string,
    args: any[],
    whatToDo: (...args: any[]) => any
  ) {
    this.protectReservedKeys(functionName);

    if (!this.callsMap.get(functionName)) {
      this.callsMap.set(functionName, new Map().set("_calls", []));
    }

    const funcMockMap = this.callsMap.get(functionName);
    funcMockMap.set(
      this.parseArgs(args),
      new Map().set("mock", whatToDo).set("calls", [])
    );

    this.callsMap.set(functionName, funcMockMap);
    this.refreshMockFunction(functionName);
  }

  private protectReservedKeys(functionName: string) {
    if (functionName === "_calls") {
      throw new Error("Function name _calls is reserved");
    }
  }

  private parseArgs(args: any[]) {
    // todo: for objects we should use a hash or order the keys alphabetically
    return args.map((arg) => JSON.stringify(arg)).join(",");
  }

  public callsTo(name: string, args: any[]): Call[] {
    const func = this.callsMap.get(name);
    if (!func) {
      throw new Error(`Function ${name} is not mocked`);
    }

    const key = this.parseArgs(args);
    const mockedBehaviour = func.get(key);

    if (!mockedBehaviour) {
      throw new Error(`Function ${name} is not mocked with args ${key}`);
    }

    return mockedBehaviour.get("calls");
  }

  public totalCallsTo(name: string): Call[] {
    const func = this.callsMap.get(name);
    if (!func) {
      throw new Error(`Function ${name} is not mocked`);
    }

    return func.get("_calls");
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

      const newCall = {
        args,
        key,
        date: new Date().toISOString(),
      };

      this.saveMockedCallWithArgs(mockedBehaviour, newCall);
      this.saveFunctionCall(mockedFunction, newCall, mockedBehaviour);

      return mockedBehaviour.get("mock")(...args);
    };
  }

  private saveMockedCallWithArgs(
    mockedBehaviour: any,
    newCall: { args: any[]; key: string; date: string }
  ) {
    mockedBehaviour.set("calls", mockedBehaviour.get("calls").concat(newCall));
  }

  private saveFunctionCall(
    mockedFunction: any,
    newCall: { args: any[]; key: string; date: string },
    mockedBehaviour: any
  ) {
    mockedFunction.set(
      "_calls",
      mockedFunction.get("_calls").concat({
        ...newCall,
        mockedBehaviour: mockedBehaviour.get("mock"),
      })
    );
  }
}

export class Mockit {
  static mock<T extends any>(_clazz: T): T {
    return new Mock() as T;
  }

  static spy(mock) {
    return {
      callsTo(func: string) {
        return {
          withArgs: (args: any[]): Array<Call> => {
            const mockedCalls = mock.callsTo(func, args);
            return mockedCalls;
          },
          inTotal: (): Array<Call> => {
            const mockedCalls = mock.totalCallsTo(func);
            return mockedCalls;
          },
        };
      },
    };
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
