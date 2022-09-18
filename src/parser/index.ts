import hasher from "object-hash";

export class Parser {
  hash(args: any) {
    return hasher(args);
  }
}

export abstract class AbstractParser {
  abstract hash(args: any): string;
}
