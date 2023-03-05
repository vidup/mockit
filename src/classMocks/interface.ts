import { FunctionMock } from "../internal";

export class InterfaceClassMock {
  constructor(functionsToMock: string[]) {
    for (const func of functionsToMock) {
      this[func] = FunctionMock(func);
    }
  }
}
