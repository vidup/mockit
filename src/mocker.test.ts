import { Mockit } from "./mocker";

abstract class Animal {
  abstract makeSound(): string;
}

class Dog implements Animal {
  constructor() {}
  makeSound() {
    return "Woof!";
  }
}

describe("Mockit", () => {
  test("it should allow to replace a class function returned value", () => {
    const dog = new Dog();
    expect(dog.makeSound()).toBe("Woof!");

    const mockDog = Mockit.mock(dog);
    Mockit.when(mockDog).calls("makeSound", []).thenReturn("CROAAA!");
    expect(mockDog.makeSound()).toBe("CROAAA!");
  });

  test("it should allow to replace a throwing method by a returning one", () => {
    class BasicAnimal extends Animal {
      makeSound(): string {
        throw new Error("Method not implemented.");
      }
    }

    expect(() => {
      Mockit.mock(new BasicAnimal()).makeSound();
    }).toThrow();

    const mockDog = Mockit.mock(new BasicAnimal());
    Mockit.when(mockDog).calls("makeSound", []).thenReturn("CROAAA!");
    expect(mockDog.makeSound()).toBe("CROAAA!");
  });

  test("it should allow to set a custom throw message", () => {
    const dog = new Dog();
    expect(dog.makeSound()).toBe("Woof!");

    const mockDog = Mockit.mock(dog);
    Mockit.when(mockDog).calls("makeSound", []).thenThrow("CROA ERROR!");

    expect(() => {
      mockDog.makeSound();
    }).toThrowError("CROA ERROR!");
  });

  test("it should allow to set a custom Error", () => {
    const dog = new Dog();
    expect(dog.makeSound()).toBe("Woof!");

    const mockDog = Mockit.mock(dog);
    Mockit.when(mockDog)
      .calls("makeSound", [])
      .thenThrow(new Error("CROA ERROR 2!"));
    expect(() => {
      mockDog.makeSound();
    }).toThrowError("CROA ERROR 2!");
  });

  test("it should allow to set a custom call", () => {
    class BackgroundCheck {
      private calls = 0;
      constructor() {}

      check(): void {
        this.calls++;
      }

      getCalls(): number {
        return this.calls;
      }
    }

    const backgroundCheck = new BackgroundCheck();
    expect(backgroundCheck.getCalls()).toBe(0);

    const mockDog = Mockit.mock(new Dog());
    Mockit.when(mockDog)
      .calls("makeSound", [])
      .thenCall(() => {
        backgroundCheck.check();
      });

    mockDog.makeSound();
    expect(backgroundCheck.getCalls()).toBe(1);
  });
});
