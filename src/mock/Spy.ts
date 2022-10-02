import { Mock } from ".";
import { Any } from "../Any";

import type { Call } from "../types/call";
import type { GetClassMethods } from "../types/GetClassMethods";

function deepValidate(original: Object, objectContainingAny: Object) {
  return Object.entries(objectContainingAny).every(([key, value]) => {
    if (Any.isAny(value)) {
      return value.isValid(original[key]);
    }

    if (Any.containsAny(value)) {
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
        const mockedCalls = mock.getCallsInstance().callsTo(func, args);
        return mockedCalls;
      },
      inTotal: (): Array<Call> => {
        const mockedCalls = mock.getCallsInstance().totalCallsTo(func);
        return mockedCalls;
      },
    };
  }

  public method(func: GetClassMethods<T>) {
    return new MethodAsserter<T>(this.mock, func);
  }
}

class Stats<T> {
  constructor(
    private readonly mock: Mock<T>,
    private readonly func: GetClassMethods<T>
  ) {}

  public get calls() {
    return this.mock.getCallsInstance().totalCallsTo(this.func);
  }

  public callsWithArgs(args: any[]) {
    return this.mock.getCallsInstance().callsTo(this.func, args);
  }

  // todo: call with strings etc...
}

class MethodAsserter<T> {
  public stats: Stats<T>;
  constructor(
    private readonly mock: Mock<T>,
    private readonly func: GetClassMethods<T>
  ) {
    this.stats = new Stats<T>(mock, func);
  }

  public get hasBeenCalled(): boolean {
    return this.mock.getCallsInstance().totalCallsTo(this.func).length > 0;
  }

  public hasBeenCalledWith(...args: any[]): boolean {
    if (args.some((arg) => Any.isAny(arg) || Any.containsAny(arg))) {
      return this.hasBeenCalledOnceWithAnyArgs(args);
    }

    const mockedCalls = this.mock.getCallsInstance().callsTo(this.func, args);
    return mockedCalls.length > 0;
  }

  public hasBeenCalledNTimes(times: number): boolean {
    const mockedCalls = this.mock.getCallsInstance().totalCallsTo(this.func);
    return mockedCalls.length === times;
  }

  public hasBeenCalledNTimesWith(args: any[], times: number): boolean {
    if (args.some((arg) => Any.isAny(arg) || Any.containsAny(arg))) {
      return this.hasBeenCalledOnceWithAnyArgs(args, times);
    }
    const mockedCalls = this.mock.getCallsInstance().callsTo(this.func, args);
    return mockedCalls.length === times;
  }

  public get hasBeenCalledOnce(): boolean {
    return this.hasBeenCalledNTimes(1);
  }

  public get hasBeenCalledTwice(): boolean {
    return this.hasBeenCalledNTimes(2);
  }

  public get hasBeenCalledThrice(): boolean {
    return this.hasBeenCalledNTimes(3);
  }

  public hasBeenCalledOnceWith(...args: any[]): boolean {
    return this.hasBeenCalledNTimesWith(args, 1);
  }

  public hasBeenCalledTwiceWith(...args: any[]): boolean {
    return this.hasBeenCalledNTimesWith(args, 2);
  }

  public hasBeenCalledThriceWith(...args: any[]): boolean {
    return this.hasBeenCalledNTimesWith(args, 3);
  }

  private hasBeenCalledOnceWithAnyArgs(args: any[], times?: number): boolean {
    const calls = this.mock.getCallsInstance().totalCallsTo(this.func);

    const notAnyArgs = args
      .map((arg, index) => [arg, index])
      .filter(([arg]) => !Any.containsAny(arg) && !Any.isAny(arg));

    const anyArgs: [Any, number][] = args
      .map<[Any, number]>((arg, index) => [arg, index])
      .filter(([arg]) => Any.isAny(arg));

    const containingAnyArgs: [Object, number][] = args
      .map<[Any, number]>((arg, index) => [arg, index])
      .filter(([arg]) => Any.containsAny(arg) && !Any.isAny(arg));

    const matchingCalls = calls.filter((call) => {
      const args = call.args;

      const notAnyArgsMatch = notAnyArgs.every(
        ([arg, index]) => args[index] === arg
      );

      const anyArgsMatch = anyArgs.every(([arg, index]) => {
        return arg.isValid(args[index]);
      });

      const containingAnyArgsMatch = containingAnyArgs.every(([arg, index]) => {
        return deepValidate(args[index], arg);
      });

      return notAnyArgsMatch && anyArgsMatch && containingAnyArgsMatch;
    });

    if (times) {
      return matchingCalls.length === times;
    }

    return matchingCalls.length > 0;
  }
}
