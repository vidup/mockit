import { HashingMap } from "../../HashingMap";
import { NewBehaviourParam } from "../../types/behaviour";

export function setCatch(target, prop, newValue, receiver) {
  if (prop === "init") {
    Reflect.set(target, "defaultBehaviour", newValue.defaultBehaviour);
    Reflect.set(target, "calls", []);
    Reflect.set(target, "functionName", newValue.functionName);
    Reflect.set(target, "mockMap", newValue.mockMap);
    Reflect.set(target, "callsMap", newValue.callsMap);
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
      const { args, customBehaviour } = newValue as {
        args: any[];
        customBehaviour: NewBehaviourParam;
      };

      const mockMap: HashingMap = Reflect.get(target, "mockMap");
      const existingCustomBehaviour = mockMap.get(args) as {
        calls: any[];
        customBehaviour: NewBehaviourParam;
      };
      mockMap.set(args, {
        customBehaviour,
        calls: existingCustomBehaviour?.calls ?? [],
        // This is important to keep track of calls in case of multiple behaviours
      });
      break;
    }
    default:
      throw new Error("Unauthorized property");
  }

  return;
}
