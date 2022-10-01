import { HashingMap } from "../HashingMap";
import { Parser } from "../parser";
import { Call } from "../types/call";
import { GetClassMethods } from "../types/GetClassMethods";
import { Stubies } from "./stubies";

export class Calls<T> {
  private callsMap: HashingMap = new HashingMap();

  constructor(private readonly stubies: Stubies<T>) {}

  public registerCall(functionName: GetClassMethods<T>, args?: any[]) {
    const functionCallsMap =
      this.getOrCreateCallsMapForFunctionName(functionName);

    this.saveFunctionCall(functionName, args, functionCallsMap);

    const functionCallsMapForArgs = this.getOrCreateCallsMapForFunctionWithArgs(
      functionName,
      args
    );

    const newCall: Call = {
      args,
      key: new Parser().hash(args),
      date: new Date().toISOString(),
      mockedBehaviour: functionCallsMapForArgs.get("mock"),
      previousCalls: functionCallsMapForArgs.get("calls"),
    };

    functionCallsMapForArgs.set("calls", [
      ...functionCallsMapForArgs.get<Call[]>("calls"),
      newCall,
    ]);

    this.callsMap.set(
      functionName,
      this.callsMap
        .get<HashingMap>(functionName)
        .set(args, functionCallsMapForArgs)
    );

    this.callsMap.set(functionName, functionCallsMap);
  }

  private saveFunctionCall(
    functionName: GetClassMethods<T>,
    args: any[],
    functionCallsMap: HashingMap
  ) {
    const newCall: Call = {
      args,
      key: new Parser().hash(args),
      date: new Date().toISOString(),
      mockedBehaviour: this.stubies.getMock(functionName, args),
      previousCalls: functionCallsMap.get("calls"),
    };

    functionCallsMap.set("calls", [
      ...functionCallsMap.get<Call[]>("calls"),
      newCall,
    ]);
  }

  private getOrCreateCallsMapForFunctionWithArgs(
    functionName: GetClassMethods<T>,
    args: any[]
  ) {
    if (!this.callsMap.get<HashingMap>(functionName).has(args)) {
      this.callsMap.set(
        functionName,
        this.callsMap
          .get<HashingMap>(functionName)
          .set(args, new HashingMap().set("calls", []))
      );
    }

    return this.callsMap.get<HashingMap>(functionName).get<HashingMap>(args);
  }

  private getOrCreateCallsMapForFunctionName(
    functionName: string | number | symbol
  ) {
    if (!this.callsMap.has(functionName)) {
      this.callsMap.set(functionName, new HashingMap().set("calls", []));
    }

    return this.callsMap.get<HashingMap>(functionName);
  }

  public callsTo(functionName: GetClassMethods<T>, args: any[]): Call[] {
    this.getOrCreateCallsMapForFunctionName(functionName);
    const mockedBehaviour = this.getOrCreateCallsMapForFunctionWithArgs(
      functionName,
      args
    );

    return mockedBehaviour.get("calls");
  }

  public totalCallsTo(name: GetClassMethods<T>): Call[] {
    const func = this.getOrCreateCallsMapForFunctionName(name);
    return func.get<Call[]>("calls");
  }
}
