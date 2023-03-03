import { ZodType } from "zod";

import { flattenObjectOrArrays } from "./flattenObject";
import { getDeepValue } from "./getDeepValue";

export function countMatchingCalls({
  STOP_ONCE_MATCHES_TIMES,
  expectedArgs,
  calledArgsList,
}: {
  expectedArgs: any[];
  calledArgsList: any[];
  STOP_ONCE_MATCHES_TIMES?: number;
}) {
  let matches = 0;
  let allArgsMatch = expectedArgs.map(() => false);
  for (
    let CALLED_LIST_INDEX = 0;
    CALLED_LIST_INDEX < calledArgsList.length;
    CALLED_LIST_INDEX++
  ) {
    // Reset the array to false for the next iteration
    allArgsMatch = allArgsMatch.map(() => false);

    if (STOP_ONCE_MATCHES_TIMES && matches === STOP_ONCE_MATCHES_TIMES) {
      return true;
    }

    // Get the args for the current analysed call
    const calledArgs = calledArgsList[CALLED_LIST_INDEX];
    for (
      let SPY_ARG_INDEX = 0;
      SPY_ARG_INDEX < expectedArgs.length;
      SPY_ARG_INDEX++
    ) {
      // Here we check for each spied argument if it matches the called arg at the same index
      const arg = expectedArgs[SPY_ARG_INDEX];
      /** ZOD ARGUMENT */
      if (arg instanceof ZodType) {
        if (arg.safeParse(calledArgs[SPY_ARG_INDEX]).success) {
          allArgsMatch[SPY_ARG_INDEX] = true;
        }
        continue;
      }

      /** SIMPLE PRIMITIVE ARGUMENT */
      if (
        typeof arg === "string" ||
        typeof arg === "number" ||
        typeof arg === "boolean" ||
        typeof arg === "bigint" ||
        arg == null
      ) {
        if (arg === calledArgs[SPY_ARG_INDEX]) {
          allArgsMatch[SPY_ARG_INDEX] = true;
        }
        continue;
      }

      /** OBJECT OR ARRAY ARGUMENT */
      if (typeof arg === "object") {
        if (arg instanceof Map) {
          throw new Error("Not implemented yet");
        }

        if (arg instanceof Set) {
          throw new Error("Not implemented yet");
        }

        const flattenedObject = flattenObjectOrArrays(arg);
        // This is a flattened version of an object or array
        // { x: { y: 1 } } => { "x.y": 1 };
        // [1, 2, 3] => { "0": 1, "1": 2, "2": 3 }
        // Now we can iterate over the keys and check if the calledArg matches for each key

        const entries = Object.entries(flattenedObject);
        const objetKeysMatch = entries.map((entry) => false);
        for (let ENTRY_INDEX = 0; ENTRY_INDEX < entries.length; ENTRY_INDEX++) {
          const [key, value] = entries[ENTRY_INDEX];
          if (calledArgs[SPY_ARG_INDEX] == null) {
            // If the called arg is null, we can't check for keys so we consider
            // that it does not match, and we continue to the next entry
            continue;
          }
          const calledValue = getDeepValue(key, calledArgs[SPY_ARG_INDEX]);

          if (value instanceof ZodType) {
            if (value.safeParse(calledValue).success) {
              objetKeysMatch[ENTRY_INDEX] = true;
              continue;
            }
          }

          if (value === calledValue) {
            // Theorically it should be simple primitives only here
            objetKeysMatch[ENTRY_INDEX] = true;
          }
        }

        if (objetKeysMatch.every((m) => m)) {
          allArgsMatch[SPY_ARG_INDEX] = true;
        }
      }
    }

    if (allArgsMatch.every((m) => m)) {
      // Function exit early since it's at least once.
      matches += 1;
    }
  }
  return matches;
}
