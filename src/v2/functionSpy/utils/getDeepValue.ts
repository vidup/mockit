export function getDeepValue(path: string, obj) {
  // path is of form x.y.z.0.a etc...
  const pathParts = path.split(".");
  let current = obj;
  for (let i = 0; i < pathParts.length; i++) {
    if (current[pathParts[i]] === undefined) {
      return undefined;
    }
    current = current[pathParts[i]];
  }

  return current;
}
