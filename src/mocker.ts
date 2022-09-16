import type { Call } from "./types/call";

import { Mock } from "./mock";

export class Mockit {
  static mock<T extends any>(_clazz: T): T {
    return new Mock() as T;
  }

  static spy(mock) {
    return {
      callsTo(func: string) {
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
      },
    };
  }

  static when(mock) {
    return {
      calls(func: string, withArgs: any[]) {
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
      },
    };
  }
}
