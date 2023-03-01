import { ZodType } from "zod";

export function flattenObjectOrArrays(obj: Record<string | number, any>) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value instanceof ZodType) {
      result[key] = value;
      continue;
    }

    if (typeof value === "object") {
      // will work on arrays too :)
      const converted = flattenObjectOrArrays(value);
      for (const convertedKey in converted) {
        result[`${key}.${convertedKey}`] = converted[convertedKey];
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}
