import { z, ZodType } from "zod";
import { HashingMap } from "../HashingMap";
import { NewBehaviourParam } from "../types/behaviour";
import { flattenObjectOrArrays } from "./flattenObject";

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
              let allArgsMatch = expectedArgs.map((arg) => false);
              for (
                let CALLED_LIST_INDEX = 0;
                CALLED_LIST_INDEX < calledArgsList.length;
                CALLED_LIST_INDEX++
              ) {
                if (allArgsMatch.every((m) => m)) {
                  // Function exit early since it's at least once.
                  return true;
                } else {
                  // Reset the array to false for the next iteration
                  allArgsMatch = allArgsMatch.map((m) => false);
                }

                // Get the args for the current analysed call
                const calledArgs = calledArgsList[CALLED_LIST_INDEX];
                for (
                  let SPY_ARG_INDEX = 0;
                  SPY_ARG_INDEX < expectedArgs.length;
                  SPY_ARG_INDEX++
                ) {
                  // Here we check for each spied argument if it matches the called arg at the same index
                  const arg = expectedArgs[SPY_ARG_INDEX];
                  /** ZOD ARGUMENT */
                  if (arg instanceof z.ZodType) {
                    if (arg.safeParse(calledArgs[SPY_ARG_INDEX]).success) {
                      allArgsMatch[SPY_ARG_INDEX] = true;
                    }
                    continue;
                  }

                  /** SIMPLE PRIMITIVE ARGUMENT */
                  if (
                    typeof arg === "string" ||
                    typeof arg === "number" ||
                    typeof arg === "boolean" ||
                    typeof arg === "bigint"
                  ) {
                    if (arg === calledArgs[SPY_ARG_INDEX]) {
                      allArgsMatch[SPY_ARG_INDEX] = true;
                    }
                    continue;
                  }

                  /** OBJECT OR ARRAY ARGUMENT */
                  if (typeof arg === "object") {
                    if (arg instanceof Map) {
                      throw new Error("Not implemented yet");
                    }

                    if (arg instanceof Set) {
                      throw new Error("Not implemented yet");
                    }

                    const flattenedObject = flattenObjectOrArrays(arg);
                    // This is a flattened version of an object or array
                    // { x: { y: 1 } } => { "x.y": 1 };
                    // [1, 2, 3] => { "0": 1, "1": 2, "2": 3 }
                    // Now we can iterate over the keys and check if the calledArg matches for each key

                    const entries = Object.entries(flattenedObject);
                    const objetKeysMatch = entries.map((entry) => false);
                    for (
                      let ENTRY_INDEX = 0;
                      ENTRY_INDEX < entries.length;
                      ENTRY_INDEX++
                    ) {
                      const [key, value] = entries[ENTRY_INDEX];
                      const calledValue = getDeepValue(
                        key,
                        calledArgs[SPY_ARG_INDEX]
                      );

                      if (value instanceof z.ZodType) {
                        if (value.safeParse(calledValue).success) {
                          objetKeysMatch[ENTRY_INDEX] = true;
                          continue;
                        }
                      }

                      if (value === calledValue) {
                        // Theorically it should be simple primitives only here
                        objetKeysMatch[ENTRY_INDEX] = true;
                      }
                    }

                    if (objetKeysMatch.every((m) => m)) {
                      allArgsMatch[SPY_ARG_INDEX] = true;
                    }
                    // for (const [key, value] of entries) {
                    //   const value = getDeepValue(key, arg);
                    //   const calledValue = getDeepValue(
                    //     key,
                    //     calledArgs[SPY_ARG_INDEX]
                    //   );
                    //   if (value instanceof z.ZodType) {
                    //     if (value.safeParse(calledValue).success) {
                    //       allArgsMatch[SPY_ARG_INDEX] = true;
                    //       continue;
                    //     }
                    //   }

                    //   if (value === calledValue) {
                    //     // Theorically it should be simple primitives only here
                    //     allArgsMatch[SPY_ARG_INDEX] = true;
                    //   }
                    // }
                  }
                }
              }

              return allArgsMatch.every((m) => m);
            }
            return callsMap.hasBeenCalledWith(...expectedArgs);
          },
          get once() {
            return callsMap.hasBeenCalledNTimesWith(1, ...expectedArgs);
          },
          get twice() {
            return callsMap.hasBeenCalledNTimesWith(2, ...expectedArgs);
          },
          get thrice() {
            return callsMap.hasBeenCalledNTimesWith(3, ...expectedArgs);
          },
          nTimes(howMuch: number) {
            return callsMap.hasBeenCalledNTimesWith(howMuch, ...expectedArgs);
          },
        };
      },
    };
  }
}

export function argsContainZodSchema(...args: any[]) {
  const level0ArgscontainZodSchema = args.some(
    (arg) => arg instanceof z.ZodSchema
  );

  const objectsArgs = args.filter(
    (arg) => arg instanceof Object && !(arg instanceof ZodType)
  );
  const flattenedObjects = objectsArgs.map(flattenObjectOrArrays);
  const objectsContainZod = flattenedObjects.some((obj) => {
    return Object.values(obj).some((value) => value instanceof z.ZodSchema);
  });

  return level0ArgscontainZodSchema || objectsContainZod;
}

function getDeepValue(path: string, obj) {
  // path is of form x.y.z.0.a etc...
  const pathParts = path.split(".");
  let current = obj;
  console.log(path);
  for (let i = 0; i < pathParts.length; i++) {
    if (current[pathParts[i]] === undefined) {
      return undefined;
    }
    current = current[pathParts[i]];
  }

  return current;
}

// Now we just need to check, arg by arg, if the value is a zod schema
// then if it is not, we just expect the value to be equal to the one passed
// if it is, we expect the value to be valid against the schema
