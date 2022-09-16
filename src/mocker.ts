import hasher from "object-hash";

type Call = {
  args: any[];
  key: string;
  date: string;
};

class Mock {
  private callsMap: ComplexMap = new ComplexMap();
  constructor() {}

  registerMock(
    functionName: string,
    args: any[],
    whatToDo: (...args: any[]) => any
  ) {
    this.protectReservedKeys(functionName);

    if (!this.callsMap.get(functionName)) {
      this.callsMap.set(functionName, new ComplexMap().set("_calls", []));
    }

    const funcMockMap = this.callsMap.get<ComplexMap>(functionName);
    funcMockMap.set(
      args,
      new ComplexMap().set("mock", whatToDo).set("calls", [])
    );

    this.callsMap.set(functionName, funcMockMap);
    this.refreshMockFunction(functionName);
  }

  private protectReservedKeys(functionName: string) {
    if (functionName === "_calls") {
      throw new Error("Function name _calls is reserved");
    }
  }

  public callsTo(name: string, args: any[]): Call[] {
    const func = this.callsMap.get<ComplexMap>(name);
    if (!func) {
      throw new Error(`Function ${name} is not mocked`);
    }

    const mockedBehaviour = func.get<ComplexMap>(args);

    if (!mockedBehaviour) {
      throw new Error(`Function ${name} is not mocked with args ${args}`);
    }

    return mockedBehaviour.get("calls");
  }

  public totalCallsTo(name: string): Call[] {
    const func = this.callsMap.get<ComplexMap>(name);
    if (!func) {
      throw new Error(`Function ${name} is not mocked`);
    }

    return func.get<Call[]>("_calls");
  }

  public refreshMockFunction(name: string) {
    this[name] = (...args: any[]) => {
      const mockedFunction = this.callsMap.get<ComplexMap>(name);
      if (!mockedFunction) {
        throw new Error(`Function ${name} is not mocked`);
      }

      const mockedBehaviour = mockedFunction.get<ComplexMap>(args);
      if (!mockedBehaviour) {
        throw new Error(`Function ${name} is not mocked with args ${args}`);
      }

      const newCall = {
        args,
        key: new Parser().hash(args),
        date: new Date().toISOString(),
        mockedBehaviour: mockedBehaviour.get("mock"),
        previousCalls: mockedBehaviour.get("calls"),
      };

      this.saveMockedCallWithArgs(mockedBehaviour, newCall);
      this.saveFunctionCall(mockedFunction, newCall);

      return mockedBehaviour.get<Function>("mock")(...args);
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
    newCall: { args: any[]; key: string; date: string }
  ) {
    mockedFunction.set("_calls", mockedFunction.get("_calls").concat(newCall));
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

export class Parser {
  hash(args: any) {
    return hasher(args);
  }
}

abstract class AbstractParser {
  abstract hash(args: any): string;
}

export class ComplexMap extends Map {
  private map: Map<string, any> = new Map();
  private parser: AbstractParser = new Parser();

  get<T>(args: any): T {
    const hashedArgs = this.parser.hash(args);
    return this.map.get(hashedArgs);
  }

  set(args: any, value: any): this {
    const hashedArgs = this.parser.hash(args);
    this.map.set(hashedArgs, value);

    return this;
  }
}
