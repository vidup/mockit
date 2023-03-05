import { Behaviour, NewBehaviourParam } from "./behaviour";
import { initializeProxy, changeDefaultBehaviour } from "./index";

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
