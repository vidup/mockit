import { Mock } from ".";
import { Any } from "../Any";

import type { Call } from "../types/call";
import type { GetClassMethods } from "../types/GetClassMethods";

function containsAny(arg: any): boolean {
  if (arg instanceof Any) {
    return true;
  }

  if (typeof arg === "object" && arg != null) {
    return Object.values(arg).some((value) => containsAny(value));
  }

  return false;
}

function isAny(arg: any): arg is Any {
  return arg instanceof Any;
}

function deepValidate(original: Object, objectContainingAny: Object) {
  return Object.entries(objectContainingAny).every(([key, value]) => {
    if (isAny(value)) {
      return value.isValid(original[key]);
    }

    if (containsAny(value)) {
      return deepValidate(original[key], value);
    }

    return original[key] === value;
  });
}

export class Spy<T> {
  private mock: Mock<T>;
  constructor(mock: any) {
    this.mock = mock as Mock<T>;
  }

  public callsTo(func: GetClassMethods<T>) {
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

  public method(func: GetClassMethods<T>) {
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
        if (args.some((arg) => isAny(arg) || containsAny(arg))) {
          return this.hasBeenCalledOnceWithAnyArgs(func, args, times);
        }
        const mockedCalls = mock.callsTo(func, args);
        return mockedCalls.length === times;
      },
      hasBeenCalledOnce(): boolean {
        return this.hasBeenCalledNTimes(1);
      },
      hasBeenCalledTwice(): boolean {
        return this.hasBeenCalledNTimes(2);
      },
      hasBeenCalledThrice(): boolean {
        return this.hasBeenCalledNTimes(3);
      },

      hasBeenCalledOnceWith(args: any[]): boolean {
        return this.hasBeenCalledNTimesWith(args, 1);
      },
      hasBeenCalledTwiceWith(args: any[]): boolean {
        return this.hasBeenCalledNTimesWith(args, 2);
      },
      hasBeenCalledThriceWith(args: any[]): boolean {
        return this.hasBeenCalledNTimesWith(args, 3);
      },

      hasBeenCalledOnceWithAnyArgs(
        func: GetClassMethods<T>,
        args: any[],
        times: number
      ): boolean {
        const calls = mock.totalCallsTo(func);

        const notAnyArgs = args
          .map((arg, index) => [arg, index])
          .filter(([arg]) => !containsAny(arg) && !isAny(arg));

        const anyArgs: [Any, number][] = args
          .map<[Any, number]>((arg, index) => [arg, index])
          .filter(([arg]) => isAny(arg));

        const containingAnyArgs: [Object, number][] = args
          .map<[Any, number]>((arg, index) => [arg, index])
          .filter(([arg]) => containsAny(arg));

        console.log(containingAnyArgs);

        const matchingCalls = calls.filter((call) => {
          const args = call.args;

          const notAnyArgsMatch = notAnyArgs.every(
            ([arg, index]) => args[index] === arg
          );

          const anyArgsMatch = anyArgs.every(([arg, index]) => {
            return arg.isValid(args[index]);
          });

          const containingAnyArgsMatch = containingAnyArgs.every(
            ([arg, index]) => {
              return deepValidate(args[index], arg);
            }
          );

          console.log({
            notAnyArgsMatch,
            anyArgsMatch,
            containingAnyArgsMatch,
          });

          return notAnyArgsMatch && anyArgsMatch && containingAnyArgsMatch;
        });

        console.log(matchingCalls);

        return matchingCalls.length === times;

        if (
          calls.filter((call) => {
            return (
              notAnyArgs.every(([arg, index]) => call.args[index] === arg) &&
              anyArgs.every(([arg, index]) => {
                return arg.isValid(call.args[index]);
              }) &&
              containingAnyArgs.every(([arg, index]) => {
                return deepValidate(call.args[index], arg);
              })
            );
          }).length === times
        ) {
          return true;
        }

        return false;
      },
    };
  }
}
