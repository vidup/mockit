import { Mock } from ".";

import type { Call } from "../types/call";
import type { GetClassMethods } from "../types/GetClassMethods";

export class Spy<T> {
  private mock: Mock;
  constructor(mock: any) {
    this.mock = mock as Mock;
  }

  public callsTo(func: GetClassMethods<T>) {
    const mock = this.mock;
    return {
      withArgs: (args: any[]): Array<Call> => {
        const mockedCalls = mock.callsTo(func as string, args);
        return mockedCalls;
      },
      inTotal: (): Array<Call> => {
        const mockedCalls = mock.totalCallsTo(func as string);
        return mockedCalls;
      },
    };
  }

  public method(func: GetClassMethods<T>) {
    const mock = this.mock;
    return {
      hasBeenCalled(): boolean {
        return mock.totalCallsTo(func as string).length > 0;
      },
      hasBeenCalledWith: (args: any[]): boolean => {
        const mockedCalls = mock.callsTo(func as string, args);
        return mockedCalls.length > 0;
      },
      hasBeenCalledNTimes: (times: number): boolean => {
        const mockedCalls = mock.totalCallsTo(func as string);
        return mockedCalls.length === times;
      },
      hasBeenCalledNTimesWith(args: any[], times: number): boolean {
        const mockedCalls = mock.callsTo(func as string, args);
        return mockedCalls.length === times;
      },
    };
  }
}
