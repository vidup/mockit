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
      default:
        throw new Error("Invalid type");
    }
  }

  public isValid(new_val: any): boolean {
    return typeof this.value === typeof new_val;
  }
}
