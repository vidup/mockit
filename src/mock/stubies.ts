import { HashingMap } from "../HashingMap";
import { AnyClass } from "../types/AnyClass";
import { GetClassMethods } from "../types/GetClassMethods";

type FunctionStub = {
  action: Function;
  args?: any[];
};

export class Stubies<T> {
  private stubiesMap: HashingMap = new HashingMap();

  constructor(
    private readonly original: AnyClass<T>,
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

    if (!args) {
      this.changeDefaultMock(functionName, whatToDo);
    }

    const funcMockMap = this.stubiesMap.get<HashingMap>(functionName);
    funcMockMap.set(args, this.buildMock(whatToDo, args));

    this.stubiesMap.set(functionName, funcMockMap);
  }

  private buildMock<T>(whatToDo: Function, args?: any[]): FunctionStub {
    return {
      args,
      action: whatToDo,
    };
  }

  private createDefaultMock<T>(functionName: GetClassMethods<T>, action: any) {
    this.stubiesMap.set(
      functionName,
      new HashingMap().set("_default", this.buildMock(action))
    );
  }

  private changeDefaultMock<T>(functionName: GetClassMethods<T>, action: any) {
    const funcMockMap = this.stubiesMap.get<HashingMap>(functionName);
    funcMockMap.set("_default", this.buildMock(action));
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

    const mockedBehaviour = funcMockMap.get<FunctionStub>(args);

    if (!mockedBehaviour) {
      return funcMockMap.get<FunctionStub>("_default").action;
    }

    return mockedBehaviour.action;
  }
}
