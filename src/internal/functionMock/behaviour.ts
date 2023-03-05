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
