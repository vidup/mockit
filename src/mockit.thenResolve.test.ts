import { Mockit } from "./mockit";

class Dog {
  async makeAsyncSound(): Promise<void> {}
}

describe("Mockit > thenResolve", () => {
  test("it should allow to set a custom promise response", () => {
    const mockDog = Mockit.mock(Dog);
    Mockit.when(mockDog).calls("makeAsyncSound", []).thenResolve("CROAAA!");

    return mockDog.makeAsyncSound().then((result) => {
      expect(result).toBe("CROAAA!");
    });
  });
});
