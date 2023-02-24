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
              Reflect.get(method, "mockOf"),
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
  constructor(propertiesToMock: Array<keyof T>) {
    for (const property of propertiesToMock) {
      this[property as string] = FunctionMock(property as string);
    }
  }
}

describe("v2", () => {
  it("should not throw if calling abstract method", () => {
    const mock = Mockit.mockAbstract(Hellaw, ["hello"]);
    console.log(mock.hello);
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
  return new Proxy(
    {
      isMocked: true,
      defaultBehaviour,
      functionName,
      calls: [],
    },
    {
      apply: function (_target, _thisArg, argumentsList) {
        // mock part
        const behaviour = Reflect.get(
          _target,
          "defaultBehaviour"
        ) as NewBehaviourParam;

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
    }
  );
}
