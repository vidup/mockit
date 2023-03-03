import { ZodType, ZodSchema } from "zod";

import { flattenObjectOrArrays } from "./flattenObject";

export function argsContainZodSchema(...args: any[]) {
  const level0ArgscontainZodSchema = args.some(
    (arg) => arg instanceof ZodSchema
  );

  const objectsArgs = args.filter(
    (arg) => arg instanceof Object && !(arg instanceof ZodType)
  );
  const flattenedObjects = objectsArgs.map(flattenObjectOrArrays);
  const objectsContainZod = flattenedObjects.some((obj) => {
    return Object.values(obj).some((value) => value instanceof ZodSchema);
  });

  return level0ArgscontainZodSchema || objectsContainZod;
}
