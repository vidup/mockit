import { HashingMap } from "../HashingMap";
import { Call } from "../types/call";
import { GetClassMethods } from "../types/GetClassMethods";

export class Calls<T> {
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
  