import { HashingMap } from "../../HashingMap";
import { NewBehaviourParam } from "../../types/behaviour";

import { countMatchingCalls } from "./utils/countMatchingCalls";
import { argsContainZodSchema } from "./utils/argsContainZodSchema";

export type Call = {
  behaviour: NewBehaviourParam;
};

export class FunctionCalls {
  private calls: HashingMap = new HashingMap();
  constructor() {}

  public registerCall(args: any[], behaviour: NewBehaviourParam) {
    const existingCalls = (this.calls.get(args) ?? []) as Call[];
    this.calls.set(args, existingCalls.concat({ behaviour }));
  }

  public hasBeenCalledWith(...args: any[]) {
    return this.calls.has(args);
  }

  public hasBeenCalledNTimesWith(n: number, ...args: any[]) {
    const calls = this.calls.get<Call[] | undefined>(args);
    return calls?.length === n;
  }

  public getCalls(): Call[] {
    // Remember, the values are arrays of calls for each args combination
    // So we need to flatten them to get the whole list as a single array
    return this.calls.values<Call[]>().flat();
  }

  public getArgs() {
    return this.calls.getOriginalKeys();
  }
}

export class FunctionSpy {
  constructor(private proxy: any) {}

  private get callsMap() {
    return Reflect.get(this.proxy, "callsMap") as FunctionCalls;
  }

  public get calls() {
    return Reflect.get(this.proxy, "calls") as {
      args: any[];
      behaviour: NewBehaviourParam;
    }[];
  }

  public get hasBeenCalled() {
    const callsMap = this.callsMap;
    return {
      get atleastOnce() {
        return callsMap.getCalls().length > 0;
      },
      get once() {
        return callsMap.getCalls().length === 1;
      },
      get twice() {
        return callsMap.getCalls().length === 2;
      },
      get thrice() {
        return callsMap.getCalls().length === 3;
      },
      nTimes(howMuch: number) {
        return callsMap.getCalls().length === howMuch;
      },
      withArgs(...expectedArgs: any[]) {
        const argscontainZodSchema = argsContainZodSchema(...expectedArgs);
        const calledArgsList = callsMap.getArgs();

        return {
          get atleastOnce() {
            if (argscontainZodSchema) {
              return (
                countMatchingCalls({
                  STOP_ONCE_MATCHES_TIMES: 1, // hehe :D
                  expectedArgs,
                  calledArgsList,
                }) > 0
              );
            }
            return callsMap.hasBeenCalledWith(...expectedArgs);
          },
          get once() {
            if (argscontainZodSchema) {
              return (
                countMatchingCalls({
                  expectedArgs,
                  calledArgsList,
                }) === 1
              );
            }

            return callsMap.hasBeenCalledNTimesWith(1, ...expectedArgs);
          },
          get twice() {
            if (argscontainZodSchema) {
              return (
                countMatchingCalls({
                  expectedArgs,
                  calledArgsList,
                }) === 2
              );
            }

            return callsMap.hasBeenCalledNTimesWith(2, ...expectedArgs);
          },
          get thrice() {
            if (argscontainZodSchema) {
              return (
                countMatchingCalls({
                  expectedArgs,
                  calledArgsList,
                }) === 3
              );
            }

            return callsMap.hasBeenCalledNTimesWith(3, ...expectedArgs);
          },
          nTimes(howMuch: number) {
            if (argscontainZodSchema) {
              return (
                countMatchingCalls({
                  expectedArgs,
                  calledArgsList,
                }) === howMuch
              );
            }

            return callsMap.hasBeenCalledNTimesWith(howMuch, ...expectedArgs);
          },
        };
      },
    };
  }
}
