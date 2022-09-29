export enum Behaviour {
  Resolve,
  Reject,
  Return,
  Call,
  Throw,
}

export type NewBehaviourParam =
  | { behaviour: Behaviour.Throw; error?: any }
  | { behaviour: Behaviour.Call; callback: (...args: any[]) => any }
  | { behaviour: Behaviour.Return; returnedValue: any }
  | { behaviour: Behaviour.Resolve; resolvedValue: any }
  | { behaviour: Behaviour.Reject; rejectedValue: any };

export class Copy {
  private behaviour: Behaviour = Behaviour.Return;
  private callback: Function;
  private returnedValue: any;
  private resolvedValue: any;
  private rejectedValue: any;
  private threwValue: any;

  constructor(private readonly original: any) {
    this.propagateBehaviour();
  }

  setupBehaviour(newBehaviour: NewBehaviourParam) {
    this.behaviour = newBehaviour.behaviour;
    if (newBehaviour.behaviour === Behaviour.Call) {
      this.callback = newBehaviour.callback;
    }

    if (newBehaviour.behaviour === Behaviour.Return) {
      this.returnedValue = newBehaviour.returnedValue;
    }

    if (newBehaviour.behaviour === Behaviour.Resolve) {
      this.resolvedValue = newBehaviour.resolvedValue;
    }

    if (newBehaviour.behaviour === Behaviour.Reject) {
      this.rejectedValue = newBehaviour.rejectedValue;
    }

    if (newBehaviour.behaviour === Behaviour.Throw) {
      this.threwValue = newBehaviour.error;
    }

    this.propagateBehaviour();

    return this;
  }

  private propagateBehaviour() {
    const keys = Object.getOwnPropertyNames(this.original.prototype);
    keys.forEach((key) => {
      if (key !== "constructor") {
        switch (this.behaviour) {
          case Behaviour.Resolve:
            this[key] = () => Promise.resolve(this.resolvedValue);
            break;
          case Behaviour.Reject:
            this[key] = () => Promise.reject(this.rejectedValue);
            break;
          case Behaviour.Return:
            this[key] = () => this.returnedValue;
            break;
          case Behaviour.Call:
            this[key] = this.callback;
            break;
          case Behaviour.Throw:
            this[key] = () => {
              throw this.threwValue;
            };
            break;
          default:
            throw new Error("Unknown behaviour");
        }
      }
    });
  }
}
