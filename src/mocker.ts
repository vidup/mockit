class Mock {
  //   private calls: {
  //     key: string;
  //     whatToDo: (...args: any[]) => any;
  //   }[] = [];

  constructor() {}
}

export class Mockit {
  constructor() {}

  static mock<T extends any>(clazz: T): T {
    return new Mock() as T;
  }

  static when(mock) {
    return {
      calls(func: string, withArgs: any[]) {
        return {
          thenReturn(returnValue: any) {
            mock[func] = () => returnValue;
          },
          thenThrow(error: any extends Error ? Error : string) {
            mock[func] = () => {
              throw error;
            };
          },
        };
      },
    };
  }
}
