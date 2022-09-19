import { Mockit } from "./mockit";

class Dog {
  async makeAsyncSound(): Promise<void> {}
}

describe("Mockit > thenReject", () => {
  test("it should allow to set a custom promise rejection", () => {
    const mockDog = Mockit.mock(Dog);
    Mockit.when(mockDog)
      .calls("makeAsyncSound", [])
      .thenReject(new Error("CROA ERROR 2!"));

    return mockDog.makeAsyncSound().catch((error) => {
      expect(error.message).toBe("CROA ERROR 2!");
    });
  });
});
