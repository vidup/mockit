import { Behaviour, NewBehaviourParam } from "./types/behaviour";

abstract class Hellaw {
  abstract hello(): string;
  abstract world(): string;
}

type AbstractClass<T> = abstract new (...args: any[]) => T;
type Class<T> = new (...args: any[]) => T;
type FunctionOf<T> = T extends (...args: any[]) => any ? T : never;

class Mockit {
  static mockAbstract<T>(
    original: AbstractClass<T>,
    propertiesToMock: Array<keyof T>
  ): T {
    return new Mock<T>(propertiesToMock) as T;
  }

  static whenMethod<T>(method: any) {
    return {
      isCalledWith(...args: any[]) {
        return {
          thenReturn(value: any) {
            console.log(
              "mocking method",
              Reflect.get(method, "defaultBehaviour"),
              "with args",
              args,
              "returning",
              value
            );
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

describe("v2", () => {
  it("should not throw if calling abstract method", () => {
    const mock = Mockit.mockAbstract(Hellaw, ["hello"]);
    Mockit.whenMethod(mock.hello).isCalledWith("a", "b").thenReturn("c");
    const x = mock.hello();
    console.log(x);
  });
});

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
