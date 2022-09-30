import { AbstractParser, Parser } from "../parser";

export class HashingMap {
  constructor(
    private readonly map = new Map(),
    private readonly parser: AbstractParser = new Parser()
  ) {}

  get<T>(args: any): T {
    const hashedArgs = this.parser.hash(args);
    return this.map.get(hashedArgs);
  }

  set(args: any, value: any): this {
    const hashedArgs = this.parser.hash(args);
    this.map.set(hashedArgs, value);

    return this;
  }

  keys(): any[] {
    return Array.from(this.map.keys());
  }

  values<T>(): T[] {
    return Array.from(this.map.values());
  }

  size(): number {
    return this.map.size;
  }

  has(args: any): boolean {
    const hashedArgs = this.parser.hash(args);
    return this.map.has(hashedArgs);
  }

  delete(args: any): boolean {
    const hashedArgs = this.parser.hash(args);
    return this.map.delete(hashedArgs);
  }

  clear(): void {
    this.map.clear();
  }
}
