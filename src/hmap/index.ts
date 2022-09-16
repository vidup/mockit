import { AbstractParser, Parser } from "../parser";

export class hMap extends Map {
  private map: Map<string, any> = new Map();
  private parser: AbstractParser = new Parser();

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
