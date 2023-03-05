export type SuppositionCount = "atLeastOnce" | number;
export type Supposition = {
  args: any[] | undefined;
  count: SuppositionCount;
};

export class SuppositionRegistry {
  private suppositions: Supposition[] = [];

  public addSupposition(supposition: Supposition) {
    this.suppositions.push(supposition);
  }

  public getSuppositions() {
    return this.suppositions;
  }
}

export function suppose(mock: any) {
  const suppositionsMap = Reflect.get(
    mock,
    "suppositionsMap"
  ) as SuppositionRegistry;
  return {
    willBeCalled: {
      get atLeastOnce() {
        return suppositionsMap.addSupposition({
          args: undefined,
          count: "atLeastOnce",
        });
      },
      get once() {
        return suppositionsMap.addSupposition({
          args: undefined,
          count: 1,
        });
      },
      get twice() {
        return suppositionsMap.addSupposition({
          args: undefined,
          count: 2,
        });
      },
      get thrice() {
        return suppositionsMap.addSupposition({
          args: undefined,
          count: 3,
        });
      },
      nTimes(n: number) {
        return suppositionsMap.addSupposition({
          args: undefined,
          count: n,
        });
      },
    },
    willBeCalledWith(...args: any[]) {
      return {
        get atLeastOnce() {
          return suppositionsMap.addSupposition({
            args,
            count: "atLeastOnce",
          });
        },
        get once() {
          return suppositionsMap.addSupposition({
            args,
            count: 1,
          });
        },
        get twice() {
          return suppositionsMap.addSupposition({
            args,
            count: 2,
          });
        },
        get thrice() {
          return suppositionsMap.addSupposition({
            args,
            count: 3,
          });
        },
        nTimes(n: number) {
          return suppositionsMap.addSupposition({
            args,
            count: n,
          });
        },
      };
    },
  };
}
