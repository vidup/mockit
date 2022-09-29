import { HashingMap } from "../HashingMap";
import { Parser } from "../parser";

import type { Call } from "../types/call";
import { GetClassMethods } from "../types/GetClassMethods";
import { Behaviour } from "./Copy";

export class Mock<T> {
  private callsMap: HashingMap = new HashingMap();
  constructor() {}

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

type NewBehaviourParam =
  | { behaviour: Behaviour.Throw; error?: any }
  | { behaviour: Behaviour.Call; callback: (...args: any[]) => any }
  | { behaviour: Behaviour.Return; returnedValue: any }
  | { behaviour: Behaviour.Resolve; resolvedValue: any }
  | { behaviour: Behaviour.Reject; rejectedValue: any };

export class Mock2<T> {
  public calls: Calls<T> = new Calls<T>();
  private stubies: Stubies<T>;
  private behaviour: Behaviour = Behaviour.Return;

  constructor(private readonly original: new () => T) {
    this.propagateBehaviour();
    this.stubies = new Stubies<T>(
      original,
      this.getActionByBehaviour({
        behaviour: this.behaviour as Behaviour.Return,
        returnedValue: undefined,
      })
    );
  }

  setupBehaviour(newBehaviour: NewBehaviourParam) {
    this.behaviour = newBehaviour.behaviour;
    this.stubies.changeDefaultBehaviour(
      this.getActionByBehaviour(newBehaviour)
    );

    return this;
  }

  private getActionByBehaviour(newBehaviour: NewBehaviourParam) {
    if (newBehaviour.behaviour === Behaviour.Call) {
      return newBehaviour.callback;
    }

    if (newBehaviour.behaviour === Behaviour.Return) {
      return () => newBehaviour.returnedValue;
    }

    if (newBehaviour.behaviour === Behaviour.Resolve) {
      return () => Promise.resolve(newBehaviour.resolvedValue);
    }

    if (newBehaviour.behaviour === Behaviour.Reject) {
      return () => Promise.reject(newBehaviour.rejectedValue);
    }

    if (newBehaviour.behaviour === Behaviour.Throw) {
      return () => {
        throw newBehaviour.error;
      };
    }

    return () => {
      throw new Error("Behaviour not implemented");
    };
  }

  private propagateBehaviour() {
    const keys = Object.getOwnPropertyNames(
      this.original.prototype
    ) as GetClassMethods<T>[];
    keys.forEach((key) => {
      if (key !== "constructor") {
        this[String(key)] = (...args: any[]) => {
          this.calls.registerCall(key, args);
          const whatToDo = this.stubies.getMock(key, args);
          return whatToDo(...args);
        };
      }
    });
  }

  getStubsInstance() {
    return this.stubies;
  }

  getCallsInstance() {
    return this.calls;
  }
}

class Stubies<T> {
  private stubiesMap: HashingMap = new HashingMap();

  constructor(
    private readonly original: new () => T,
    private action: Function
  ) {
    const keys = Object.getOwnPropertyNames(
      original.prototype
    ) as GetClassMethods<T>[];

    keys
      .filter((key) => key !== "constructor")
      .forEach((key) => {
        this.createDefaultMock(key, action);
      });
  }

  public registerMock<T>(
    functionName: GetClassMethods<T>,
    args: any[],
    whatToDo: Function
  ) {
    if (!this.stubiesMap.get(functionName)) {
      this.createDefaultMock<T>(functionName, this.action);
    }

    const funcMockMap = this.stubiesMap.get<HashingMap>(functionName);
    funcMockMap.set(args, whatToDo);

    this.stubiesMap.set(functionName, funcMockMap);
  }

  private createDefaultMock<T>(functionName: GetClassMethods<T>, action: any) {
    this.stubiesMap.set(functionName, new HashingMap().set("_default", action));
  }

  private changeDefaultMock<T>(functionName: GetClassMethods<T>, action: any) {
    const funcMockMap = this.stubiesMap.get<HashingMap>(functionName);
    funcMockMap.set("_default", action);
    this.stubiesMap.set(functionName, funcMockMap);
  }

  public changeDefaultBehaviour<T>(action: Function) {
    const keys = Object.getOwnPropertyNames(
      this.original.prototype
    ) as GetClassMethods<T>[];

    keys
      .filter((key) => key !== "constructor")
      .forEach((key) => {
        this.changeDefaultMock(key, action);
      });
  }

  public getMock<T>(functionName: GetClassMethods<T>, args: any[]): Function {
    const funcMockMap = this.stubiesMap.get<HashingMap>(functionName);
    const mockedBehaviour = funcMockMap.get<Function>(args);

    if (!mockedBehaviour) {
      return funcMockMap.get("_default");
    }

    return mockedBehaviour;
  }
}

class Calls<T> {
  private callsMap: HashingMap = new HashingMap();
  public registerCall(functionName: GetClassMethods<T>, args?: any[]) {
    if (!this.callsMap.get(functionName)) {
      this.callsMap.set(functionName, new HashingMap().set("_calls", []));
    }

    const funcMockMap = this.callsMap.get<HashingMap>(functionName);
    funcMockMap.set(args, new HashingMap().set("calls", []));

    this.callsMap.set(functionName, funcMockMap);
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
}
