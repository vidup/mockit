import { HashingMap } from "../HashingMap";
import { FunctionCalls } from "../functionSpy";

export function getCatch(target, prop, _receiver) {
  switch (prop) {
    case "calls":
    case "defaultBehaviour":
    case "functionName":
      return Reflect.get(target, prop);
    case "mockMap":
      const mockMap = Reflect.get(target, "mockMap") as HashingMap;
      return mockMap;
    case "callsMap":
      const callsMap = Reflect.get(target, "callsMap") as FunctionCalls;
      return callsMap;
    default:
      throw new Error("Unauthorized property");
  }
}
