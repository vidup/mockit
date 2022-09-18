import { Call } from "../types/call";
import { Mock } from ".";

export class Spy {
  private mock: Mock;
  constructor(mock: any) {
    this.mock = mock as Mock;
  }

  public callsTo(func: string) {
    return {
      withArgs: (args: any[]): Array<Call> => {
        const mockedCalls = this.mock.callsTo(func, args);
        return mockedCalls;
      },
      inTotal: (): Array<Call> => {
        const mockedCalls = this.mock.totalCallsTo(func);
        return mockedCalls;
      },
    };
  }
}
