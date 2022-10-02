export class Any {
  private value: any;
  constructor(private readonly val: String | Object | Number | Boolean) {
    // @ts-expect-error fix later, for now they don't consider it callable even though it is
    switch (typeof val()) {
      case "string":
        this.value = "";
        break;
      case "object":
        this.value = {};
        break;
      case "number":
        this.value = 0;
        break;
      case "boolean":
        this.value = false;
        break;
      case "function":
        this.value = () => {};
        break;
      default:
        // @ts-expect-error
        throw new Error("Invalid type " + typeof val());
    }
  }

  public isValid(new_val: any): boolean {
    return typeof this.value === typeof new_val;
  }

  static isAny(arg: any): arg is Any {
    return arg instanceof Any;
  }

  static containsAny(arg: any): boolean {
    if (arg instanceof Any) {
      return true;
    }

    if (typeof arg === "object" && arg != null) {
      return Object.values(arg).some((value) => Any.containsAny(value));
    }

    return false;
  }
}
