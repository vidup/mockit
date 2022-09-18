import { Mock } from ".";

export class MockInjector<T> {
  private readonly mock: Mock;
  constructor(mock: any) {
    this.mock = mock as Mock;
  }

  public calls(func: string, withArgs: any[]) {
    const mock = this.mock;
    return {
      thenReturn(returnValue: any) {
        mock.registerMock(func, withArgs, () => returnValue);
      },
      thenThrow(error: any extends Error ? Error : string) {
        mock.registerMock(func, withArgs, () => {
          throw error;
        });
      },
      thenCall(f: (...args: any[]) => any) {
        mock.registerMock(func, withArgs, () => {
          return f();
        });
      },
      thenResolve(returnValue: any) {
        mock.registerMock(func, withArgs, async () => {
          return returnValue;
        });
      },
      thenReject(error: any extends Error ? Error : string) {
        mock.registerMock(func, withArgs, async () => {
          throw error;
        });
      },
    };
  }
}
