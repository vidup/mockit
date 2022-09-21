import { Mock } from ".";

import type { Call } from "../types/call";
import type { GetClassMethods } from "../types/GetClassMethods";

export class Spy<T> {
  private mock: Mock<T>;
  constructor(mock: any) {
    this.mock = mock as Mock<T>;
  }

  public callsTo(func: GetClassMethods<T>) {
    const mock = this.mock;
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
  }

  public method(func: GetClassMethods<T>) {
    const mock = this.mock;
    return {
      hasBeenCalled(): boolean {
        return mock.totalCallsTo(func).length > 0;
      },
      hasBeenCalledWith: (args: any[]): boolean => {
        const mockedCalls = mock.callsTo(func, args);
        return mockedCalls.length > 0;
      },
      hasBeenCalledNTimes: (times: number): boolean => {
        const mockedCalls = mock.totalCallsTo(func);
        return mockedCalls.length === times;
      },
      hasBeenCalledNTimesWith(args: any[], times: number): boolean {
        const mockedCalls = mock.callsTo(func, args);
        return mockedCalls.length === times;
      },
      hasBeenCalledOnce(): boolean {
        return this.hasBeenCalledNTimes(1);
      },
      hasBeenCalledTwice(): boolean {
        return this.hasBeenCalledNTimes(2);
      },
      hasBeenCalledThrice(): boolean {
        return this.hasBeenCalledNTimes(3);
      },

      hasBeenCalledOnceWith(args: any[]): boolean {
        return this.hasBeenCalledNTimesWith(args, 1);
      },
      hasBeenCalledTwiceWith(args: any[]): boolean {
        return this.hasBeenCalledNTimesWith(args, 2);
      },
      hasBeenCalledThriceWith(args: any[]): boolean {
        return this.hasBeenCalledNTimesWith(args, 3);
      },
    };
  }
}
