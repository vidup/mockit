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
      withArgs(...args: any[]) {
        const argscontainZodSchema = argsContainZodSchema(...args);
        const calledArgsList = callsMap.getArgs();

        return {
          get atleastOnce() {
            if (argscontainZodSchema) {
              let matchesWithSchema = false;
              for (const calledArgs of calledArgsList) {
                if (matchesWithSchema) return true;

                for (let i = 0; i < args.length; i++) {
                  const arg = args[i];
                  /** ZOD ARGUMENT */
                  if (arg instanceof z.ZodType) {
                    if (arg.safeParse(calledArgs[i]).success) {
                      matchesWithSchema = true;
                    }
                    continue;
                  }

                  /** SIMPLE PRIMITIVE ARGUMENT */
                  if (
                    arg instanceof String ||
                    arg instanceof Number ||
                    arg instanceof Boolean
                  ) {
                    if (arg === calledArgs[i]) {
                      matchesWithSchema = true;
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

                    const flattenedObjects = flattenObjectOrArrays(arg);
                    for (const [key, value] of Object.entries(
                      flattenedObjects
                    )) {
                      const value = getDeepValue(key, arg);
                      const calledValue = getDeepValue(key, calledArgs[i]);
                      if (value instanceof z.ZodType) {
                        if (value.safeParse(calledValue).success) {
                          matchesWithSchema = true;
                          continue;
                        }
                      }

                      if (value === calledValue) {
                        // Theorically it should be simple primitives only here
                        matchesWithSchema = true;
                      }
                    }
                  }
                }

                if (matchesWithSchema) {
                  return true;
                }
              }

              return false;
            }
            return callsMap.hasBeenCalledWith(...args);
          },
          get once() {
            return callsMap.hasBeenCalledNTimesWith(1, ...args);
          },
          get twice() {
            return callsMap.hasBeenCalledNTimesWith(2, ...args);
          },
          get thrice() {
            return callsMap.hasBeenCalledNTimesWith(3, ...args);
          },
          nTimes(howMuch: number) {
            return callsMap.hasBeenCalledNTimesWith(howMuch, ...args);
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
      throw new Error(`Path ${path} does not exist`);
    }
    current = current[pathParts[i]];
  }

  return current;
}

// Now we just need to check, arg by arg, if the value is a zod schema
// then if it is not, we just expect the value to be equal to the one passed
// if it is, we expect the value to be valid against the schema
