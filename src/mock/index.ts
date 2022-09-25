import { HashingMap } from "../HashingMap";
import { Parser } from "../parser";

import type { Call } from "../types/call";
import { GetClassMethods } from "../types/GetClassMethods";

export class Mock<T> {
  public mocks: { functionName: GetClassMethods<T>; args: any[] }[] = [];
  private callsMap: HashingMap = new HashingMap();
  constructor(original: new () => T) {
    Object.getOwnPropertyNames(Object.getPrototypeOf(original)).map((key) => {
      this.generateInitialMockMethod(key as GetClassMethods<T>);
    });
  }

  private generateInitialMockMethod(functionName: GetClassMethods<T>) {
    this[String(functionName)] = (...args: any[]) => {
      const functionMock = this.callsMap.get<HashingMap>(functionName);
      this.callsMap.set(
        String(functionName),
        new HashingMap().set("_calls", [])
      );
      const argsMock = functionMock?.get<HashingMap>(args);

      if (argsMock) {
        return argsMock.get<Function>("mock")(...args);
      } else {
        this.mocks.push({ functionName, args });
        argsMock
          .set("mock", () => {
            throw new Error(
              `Function ${String(
                functionName
              )} is not mocked with args ${args}. Please setup a behaviour`
            );
          })
          .set("calls", []);
      }
    };
  }

  registerMockRespons(whatToDo: (...args: any[]) => any) {
    const lastRegistratedMock = this.mocks.pop();
    if (!lastRegistratedMock) throw new Error("No mock to register");
    this.registerMock(lastRegistratedMock.functionName, lastRegistratedMock.args, whatToDo);
  }

  registerMock(
    functionName: GetClassMethods<T>,
    args: any[],
    whatToDo: (...args: any[]) => any
  ) {
    this.protectReservedKeys(functionName);

    if (!this.callsMap.get(functionName)) {
      this.callsMap.set(functionName, new HashingMap().set("_calls", []));
    }

    const funcMockMap = this.callsMap.get<HashingMap>(functionName);
    funcMockMap.set(
      args,
      new HashingMap().set("mock", whatToDo).set("calls", [])
    );

    this.callsMap.set(functionName, funcMockMap);
    this.refreshMockFunction(functionName);
  }

  private protectReservedKeys(functionName: GetClassMethods<T>) {
    if (functionName === "_calls") {
      throw new Error("Function name _calls is reserved");
    }
  }

  public callsTo(name: GetClassMethods<T>, args: any[]): Call[] {
    const func = this.callsMap.get<HashingMap>(name);
    if (!func) {
      throw new Error(`Function ${String(name)} is not mocked`);
    }

    const mockedBehaviour = func.get<HashingMap>(args);

    if (!mockedBehaviour) {
      throw new Error(
        `Function ${String(name)} is not mocked with args ${args}`
      );
    }

    return mockedBehaviour.get("calls");
  }

  public totalCallsTo(name: GetClassMethods<T>): Call[] {
    const func = this.callsMap.get<HashingMap>(name);
    if (!func) {
      throw new Error(`Function ${String(name)} is not mocked`);
    }

    return func.get<Call[]>("_calls");
  }

  public refreshMockFunction(name: GetClassMethods<T>) {
    this[String(name)] = (...args: any[]) => {
      const mockedFunction = this.callsMap.get<HashingMap>(name);
      if (!mockedFunction) {
        throw new Error(`Function ${String(name)} is not mocked`);
      }

      const mockedBehaviour = mockedFunction.get<HashingMap>(args);
      if (!mockedBehaviour) {
        throw new Error(
          `Function ${String(name)} is not mocked with args ${args}`
        );
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
