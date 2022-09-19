import hash from "node-object-hash";

export class Parser {
  private hasher = hash({ coerce: { set: true, symbol: true } });

  hash(args: any) {
    return this.hasher.hash(args);
  }
}

export abstract class AbstractParser {
  abstract hash(args: any): string;
}
