import { Mockit } from "./mockit";

class Dog {
  makeSound(): string {
    throw new Error("Method not implemented.");
  }
}

describe("Mockit > thenCall", () => {
  test("it should allow to replace a throwing method by a returning one", () => {
    expect(() => {
      Mockit.mock(Dog).makeSound();
    }).toThrow();

    const mockDog = Mockit.mock(Dog);
    Mockit.when(mockDog).calls("makeSound", []).thenReturn("CROAAA!");
    expect(mockDog.makeSound()).toBe("CROAAA!");
  });

  test("it should allow to set a custom call", () => {
    class BackgroundCheck {
      private calls = 0;

      check(): void {
        this.calls++;
      }

      getCalls(): number {
        return this.calls;
      }
    }

    const backgroundCheck = new BackgroundCheck();
    expect(backgroundCheck.getCalls()).toBe(0);

    const mockDog = Mockit.mock(Dog);
    Mockit.when(mockDog)
      .calls("makeSound", [])
      .thenCall(() => {
        backgroundCheck.check();
      });

    mockDog.makeSound();
    expect(backgroundCheck.getCalls()).toBe(1);
  });
});
