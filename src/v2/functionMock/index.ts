import { HashingMap } from "../../HashingMap";
import { Behaviour, NewBehaviourParam } from "../../types/behaviour";
import { FunctionCalls } from "../functionSpy";

import { applyCatch } from "./applyCatch";
import { getCatch } from "./getCatch";
import { setCatch } from "./setCatch";

export const Behaviours = {
  Return: "Return",
  Throw: "Throw",
  Call: "Call",
  Resolve: "Resolve",
  Reject: "Reject",
} as const;

export type BehaviourType = typeof Behaviours[keyof typeof Behaviours];

/**
 * This is the function mock "class", it is taking the place of the function
 * that we want to mock.
 * It is a proxy, so it makes itself look like a function but in reality is
 * a complex object that can catch calls, store and return data.
 *
 * It's a central piece of the library.
 */
export function FunctionMock(functionName: string) {
  const proxy = new Proxy(() => {}, {
    /**
     * This will be triggered when the function mock is called.
     */
    apply: applyCatch,

    /**
     * This is internal, and allow us to get information stored in the mock
     */
    get: getCatch,

    /**
     * This is internal, and allow us to set information in the mock,
     * like the default behaviour, or a custom behaviour,
     * or calls data for the spying feature.
     */
    set: setCatch,
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
    callsMap: new FunctionCalls(),
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
      thenThrow(error: any) {
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
      thenReject(error: any) {
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
          customBehaviour: {
            behaviour: Behaviour.Return,
            returnedValue: value,
          },
          args,
        });
      },
      thenThrow(error: any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Throw,
            error,
          },
          args,
        });
      },
      thenCall(callback: (...args: any[]) => any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Call,
            callback,
          },
          args,
        });
      },
      thenResolve(value: any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Resolve,
            resolvedValue: value,
          },
          args,
        });
      },

      thenReject(error: any) {
        Reflect.set(self.proxy, "newCustomBehaviour", {
          customBehaviour: {
            behaviour: Behaviour.Reject,
            rejectedValue: error,
          },
          args,
        });
      },
    };
  }
}
