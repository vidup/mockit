import { Call } from "../types/call";
import { Mock } from ".";

export class Spy {
  private mock: Mock;
  constructor(mock: any) {
    this.mock = mock as Mock;
  }

  public callsTo(func: string) {
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

  public method(func: string) {
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
    };
  }
}
