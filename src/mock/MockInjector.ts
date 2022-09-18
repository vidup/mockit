import { Mock } from ".";

export class MockInjector {
  private mock: Mock;
  constructor(mock: any) {
    this.mock = mock as Mock;
  }

  public calls(func: string, withArgs: any[]) {
    return {
      thenReturn(returnValue: any) {
        this.mock.registerMock(func, withArgs, () => returnValue);
      },
      thenThrow(error: any extends Error ? Error : string) {
        this.mock.registerMock(func, withArgs, () => {
          throw error;
        });
      },
      thenCall(f: (...args: any[]) => any) {
        this.mock.registerMock(func, withArgs, () => {
          return f();
        });
      },
      thenResolve(returnValue: any) {
        this.mock.registerMock(func, withArgs, async () => {
          return returnValue;
        });
      },
      thenReject(error: any extends Error ? Error : string) {
        this.mock.registerMock(func, withArgs, async () => {
          throw error;
        });
      },
    };
  }
}
