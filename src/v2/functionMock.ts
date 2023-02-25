import { HashingMap } from "../HashingMap";
import { Behaviour, NewBehaviourParam } from "../types/behaviour";

export const Behaviours = {
  Return: "Return",
  Throw: "Throw",
  Call: "Call",
  Resolve: "Resolve",
  Reject: "Reject",
} as const;

export type BehaviourType = typeof Behaviours[keyof typeof Behaviours];

type Call = {
  args: any[];
  behaviour: NewBehaviourParam;
};

export function FunctionMock(functionName: string) {
  const proxy = new Proxy(() => {}, {
    apply: function (_target, _thisArg, argumentsList) {
      // Checking if there is a custom behaviour for this call
      const mockMap: HashingMap = Reflect.get(_target, "mockMap");
      let behaviour: NewBehaviourParam = mockMap.get(argumentsList);

      console.log({ behaviour, argumentsList });
      console.log(mockMap.keys());

      // Default behaviour
      if (!behaviour) {
        behaviour = Reflect.get(_target, "defaultBehaviour");
        console.log("default behaviour", behaviour);
      }

      switch (behaviour.behaviour) {
        case Behaviour.Return:
          return behaviour.returnedValue;
        case Behaviour.Throw:
          throw behaviour.error;
        case Behaviour.Call:
          return behaviour.callback(...argumentsList);
        case Behaviour.Resolve:
          return Promise.resolve(behaviour.resolvedValue);
        case Behaviour.Reject:
          return Promise.reject(behaviour.rejectedValue);
        default:
          throw new Error("Mock logic not implemented yet");
      }
    },

    get: function (target, prop, _receiver) {
      switch (prop) {
        case "calls":
        case "defaultBehaviour":
        case "functionName":
          return Reflect.get(target, prop);
        default:
          throw new Error("Unauthorized property");
      }
    },

    set: function (target, prop, newValue, receiver) {
      if (prop === "init") {
        Reflect.set(target, "defaultBehaviour", newValue.defaultBehaviour);
        Reflect.set(target, "calls", []);
        Reflect.set(target, "functionName", newValue.functionName);
        Reflect.set(target, "mockMap", newValue.mockMap);
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
        case "newCustomBehaviour": {
          const { funcName, args, newBehaviour } = newValue as {
            funcName: string;
            args: any[];
            newBehaviour: NewBehaviourParam;
          };

          const mockMap: HashingMap = Reflect.get(target, "mockMap");
          mockMap.set(args, newBehaviour);
          break;
        }
        default:
          throw new Error("Unauthorized property");
      }

      return;
    },
  });

  new FunctionMockUtils(proxy).initialize(functionName);
  return proxy;
}

const defaultBehaviour: NewBehaviourParam = {
  behaviour: Behaviour.Return,
  returnedValue: undefined,
};

export function initializeProxy(proxy: any, functionName: string) {
  Reflect.set(proxy, "init", {
    defaultBehaviour,
    functionName,
    calls: [],
    mockMap: new HashingMap(),
  });
}

function changeDefaultBehaviour(proxy: any, newBehaviour: NewBehaviourParam) {
  Reflect.set(proxy, "defaultBehaviour", newBehaviour);
}

export class FunctionMockUtils {
  constructor(private proxy: any) {}

  public initialize(functionName: string) {
    initializeProxy(this.proxy, functionName);
  }

  public changeDefaultBehaviour(newBehaviour: NewBehaviourParam) {
    changeDefaultBehaviour(this.proxy, newBehaviour);
  }

  public defaultBehaviourController() {
    const self = this;
    return {
      /**
       * @param value value to return when the method is called
       */
      thenReturn(value: any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Return,
          returnedValue: value,
        });
      },
      /**
       * @param error error to throw when the method is called
       */
      thenThrow(error: Error) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Throw,
          error,
        });
      },
      /**
       * @param value value to resolve when the method is called
       */
      thenResolve(value: any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Resolve,
          resolvedValue: value,
        });
      },
      /**
       * @param error error to reject when the method is called
       */
      thenReject(error: Error) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Reject,
          rejectedValue: error,
        });
      },
      /**
       * @param callback callback to call when the method is called
       */
      thenCall(callback: (...args: any[]) => any) {
        self.changeDefaultBehaviour({
          behaviour: Behaviour.Call,
          callback,
        });
      },
    };
  }

  public callController(...args: any[]) {
    const self = this;
    return {
      thenReturn(value: any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          behaviour: Behaviour.Return,
          returnedValue: value,
          args,
        });
      },
    };
  }
}
