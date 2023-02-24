import { Behaviour, NewBehaviourParam } from "./types/behaviour";

type AbstractClass<T> = abstract new (...args: any[]) => T;
type Class<T> = new (...args: any[]) => T;
type FunctionOf<T> = T extends (...args: any[]) => any ? T : never;

class Mockit {
  /**
   * @param original abstract class to mock
   * @param propertiesToMock list of properties that
   * will be mocked. If not provided, all properties
   * will be undefined.
   * It's required because we cannot dynamically access abstract properties.
   * (they're not compiled in the JS code)
   */
  static mockAbstract<T>(
    original: AbstractClass<T>,
    propertiesToMock: Array<keyof T>
  ): T {
    return new Mock<T>(propertiesToMock) as T;
  }

  static whenMethod<T>(method: any) {
    return {
      /**
       * This function sets up the behaviour of the mocked method.
       * If the mocked method is called with parameters that are not setup for custom behaviour, this will be the default behaviour
       */
      get isCalled() {
        return {
          /**
           * @param value value to return when the method is called
           */
          thenReturn(value: any) {
            Reflect.set(method, "defaultBehaviour", {
              behaviour: Behaviour.Return,
              returnedValue: value,
            });
          },
          /**
           * @param error error to throw when the method is called
           */
          thenThrow(error: Error) {
            Reflect.set(method, "defaultBehaviour", {
              behaviour: Behaviour.Throw,
              error,
            });
          },
          /**
           * @param value value to resolve when the method is called
           */
          thenResolve(value: any) {
            Reflect.set(method, "defaultBehaviour", {
              behaviour: Behaviour.Resolve,
              returnedValue: value,
            });
          },
          /**
           * @param error error to reject when the method is called
           */
          thenReject(error: Error) {
            Reflect.set(method, "defaultBehaviour", {
              behaviour: Behaviour.Reject,
              error,
            });
          },
          /**
           * @param callback callback to call when the method is called
           */
          thenCall(callback: (...args: any[]) => any) {
            Reflect.set(method, "defaultBehaviour", {
              behaviour: Behaviour.Call,
              callback,
            });
          },
        };
      },
    };
  }
}

class Mock<T> {
  // private data = {};
  constructor(propertiesToMock: Array<keyof T>) {
    for (const property of propertiesToMock) {
      const fMock = FunctionMock(property as string);
      this[property as string] = fMock;
    }
  }
}

const defaultBehaviour: NewBehaviourParam = {
  behaviour: Behaviour.Return,
  returnedValue: undefined,
};

function FunctionMock(functionName: string) {
  const proxy = new Proxy(() => {}, {
    apply: function (_target, _thisArg, argumentsList) {
      const behaviour = Reflect.get(_target, "defaultBehaviour");

      switch (behaviour.behaviour) {
        case Behaviour.Return:
          return behaviour.returnedValue;
        case Behaviour.Throw:
          throw behaviour.error;
        case Behaviour.Call:
          return behaviour.callback(...argumentsList);
        case Behaviour.Resolve:
          return Promise.resolve(behaviour.returnedValue);
        case Behaviour.Reject:
          return Promise.reject(behaviour.error);
        default:
          throw new Error("Mock logic not implemented yet");
      }
    },

    get: function (target, prop, _receiver) {
      return Reflect.get(target, "functionName");
    },

    set: function (target, prop, newValue, receiver) {
      if (prop === "init") {
        Reflect.set(target, "defaultBehaviour", newValue.defaultBehaviour);
        Reflect.set(target, "calls", []);
        Reflect.set(target, "functionName", newValue.functionName);
        return true;
      }

      // this will list authorized properties
      switch (prop) {
        case "defaultBehaviour":
        case "calls":
        case "functionName": {
          Reflect.set(target, prop, newValue);
          break;
        }
        default:
          throw new Error("Unauthorized property");
      }

      return;
    },
  });

  initializeProxy(proxy, functionName);
  return proxy;
}

function initializeProxy(proxy: any, functionName: string) {
  Reflect.set(proxy, "init", {
    defaultBehaviour,
    functionName,
    calls: [],
  });
}

abstract class Hellaw {
  abstract hello(input: string): string;
  abstract world(): string;
}

describe("v2", () => {
  it("should setup default behaviour for abstract method", async () => {
    const returningMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(returningMock.hello).isCalled.thenReturn("world");

    const x = returningMock.hello("hello");
    expect(returningMock.hello("hello")).toBe("world");

    const throwingMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(throwingMock.hello).isCalled.thenThrow(
      new Error("error")
    );

    expect(() => throwingMock.hello("hello")).toThrowError("error");

    let counter = 0;
    const callingMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(callingMock.hello).isCalled.thenCall(() => {
      counter++;
    });

    callingMock.hello("hello");
    callingMock.hello("hello");
    expect(counter).toBe(2);
    callingMock.hello("hello");
    expect(counter).toBe(3);

    const resolvingMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(resolvingMock.hello).isCalled.thenResolve(
      "world-resolved"
    );

    const resolved = await resolvingMock.hello("hello");
    expect(resolved).toBe("world-resolved");

    const rejectingMock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(rejectingMock.hello).isCalled.thenReject(
      new Error("error-rejected")
    );

    await expect(rejectingMock.hello("hello")).rejects.toThrowError(
      "error-rejected"
    );
  });
});
