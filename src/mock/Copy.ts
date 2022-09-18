export class Copy {
  constructor(original: any) {
    const keys = Object.getOwnPropertyNames(original.prototype);
    keys.forEach((key) => {
      if (key !== "constructor") {
        this[key] = () => {};
      }
    });
  }
}
