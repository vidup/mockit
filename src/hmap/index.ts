import { AbstractParser, Parser } from "../parser";

export class HashingMap extends Map {
  constructor(
    private readonly map = new Map(),
    private readonly parser: AbstractParser = new Parser()
  ) {
    super();
  }

  get<T>(args: any): T {
    const hashedArgs = this.parser.hash(args);
    return this.map.get(hashedArgs);
  }

  set(args: any, value: any): this {
    const hashedArgs = this.parser.hash(args);
    this.map.set(hashedArgs, value);

    return this;
  }
}
