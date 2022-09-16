import { hMap } from "../hmap";
import { Parser } from "../parser";

import type { Call } from "../types/call";

export class Mock {
  private callsMap: hMap = new hMap();
  constructor() {}

  registerMock(
    functionName: string,
    args: any[],
    whatToDo: (...args: any[]) => any
  ) {
    this.protectReservedKeys(functionName);

    if (!this.callsMap.get(functionName)) {
      this.callsMap.set(functionName, new hMap().set("_calls", []));
    }

    const funcMockMap = this.callsMap.get<hMap>(functionName);
    funcMockMap.set(args, new hMap().set("mock", whatToDo).set("calls", []));

    this.callsMap.set(functionName, funcMockMap);
    this.refreshMockFunction(functionName);
  }

  private protectReservedKeys(functionName: string) {
    if (functionName === "_calls") {
      throw new Error("Function name _calls is reserved");
    }
  }

  public callsTo(name: string, args: any[]): Call[] {
    const func = this.callsMap.get<hMap>(name);
    if (!func) {
      throw new Error(`Function ${name} is not mocked`);
    }

    const mockedBehaviour = func.get<hMap>(args);

    if (!mockedBehaviour) {
      throw new Error(`Function ${name} is not mocked with args ${args}`);
    }

    return mockedBehaviour.get("calls");
  }

  public totalCallsTo(name: string): Call[] {
    const func = this.callsMap.get<hMap>(name);
    if (!func) {
      throw new Error(`Function ${name} is not mocked`);
    }

    return func.get<Call[]>("_calls");
  }

  public refreshMockFunction(name: string) {
    this[name] = (...args: any[]) => {
      const mockedFunction = this.callsMap.get<hMap>(name);
      if (!mockedFunction) {
        throw new Error(`Function ${name} is not mocked`);
      }

      const mockedBehaviour = mockedFunction.get<hMap>(args);
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
