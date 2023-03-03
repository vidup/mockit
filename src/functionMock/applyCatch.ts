import { HashingMap } from "../HashingMap";
import { Behaviour, NewBehaviourParam } from "../types/behaviour";
import { FunctionCalls } from "../functionSpy";

export function applyCatch(_target, _thisArg, argumentsList) {
  // Checking if there is a custom behaviour for this call
  const mockMap: HashingMap = Reflect.get(_target, "mockMap");

  const behaviourWithTheseArguments = mockMap.get(argumentsList) as {
    calls: any[];
    customBehaviour: NewBehaviourParam;
  };

  let behaviour = behaviourWithTheseArguments?.customBehaviour;

  // Default behaviour
  if (!behaviour) {
    behaviour = Reflect.get(_target, "defaultBehaviour");
  }

  // Adding the call to the list of calls, for the spy
  const calls = Reflect.get(_target, "calls");
  calls.push({
    args: argumentsList,
    behaviour,
  });

  const callsMap: FunctionCalls = Reflect.get(_target, "callsMap");
  callsMap.registerCall(argumentsList, behaviour);
  Reflect.set(_target, "callsMap", callsMap);

  Reflect.set(_target, "calls", calls);

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
}
