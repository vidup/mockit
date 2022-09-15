import { Mockit } from "./mocker";

abstract class Animal {
  abstract makeSound(): string;
}

class Dog implements Animal {
  constructor() {}
  makeSound() {
    return "Woof!";
  }

  async makeAsyncSound() {
    return "Woof!";
  }

  repeatSound(sound: string) {
    return "Woof " + sound;
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

  test("it should be able to mock different calls separately", () => {
    const dog = new Dog();
    expect(dog.repeatSound("yo")).toBe("Woof yo");

    const mockDog = Mockit.mock(dog);
    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("yo");
    Mockit.when(mockDog).calls("repeatSound", ["B"]).thenReturn("HELLAW!");

    expect(mockDog.repeatSound("A")).toBe("yo");
    expect(mockDog.repeatSound("B")).toBe("HELLAW!");
    expect(mockDog.repeatSound("A")).toBe("yo");
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

  test("it should allow to set a custom promise response", () => {
    const dog = new Dog();
    expect(dog.makeSound()).toBe("Woof!");

    const mockDog = Mockit.mock(dog);
    Mockit.when(mockDog).calls("makeAsyncSound", []).thenResolve("CROAAA!");

    return mockDog.makeAsyncSound().then((result) => {
      expect(result).toBe("CROAAA!");
    });
  });

  test("it should allow to set a custom promise rejection", () => {
    const dog = new Dog();
    expect(dog.makeSound()).toBe("Woof!");

    const mockDog = Mockit.mock(dog);
    Mockit.when(mockDog)
      .calls("makeAsyncSound", [])
      .thenReject(new Error("CROA ERROR 2!"));

    return mockDog.makeAsyncSound().catch((error) => {
      expect(error.message).toBe("CROA ERROR 2!");
    });
  });
});

describe("Mockit > Spying", () => {
  test("It should allow to access the function calls history for given parameters", () => {
    const dog = new Dog();
    const mockDog = Mockit.mock(dog);
    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");

    mockDog.repeatSound("A");
    mockDog.repeatSound("A");
    mockDog.repeatSound("A");

    expect(
      Mockit.spy(mockDog).callsTo("repeatSound").withArgs(["A"]).length
    ).toBe(3);
  });

  test("It should also allow to access the whole function call history", () => {
    const dog = new Dog();
    const mockDog = Mockit.mock(dog);
    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    Mockit.when(mockDog).calls("repeatSound", ["B"]).thenReturn("CROAAA!");
    mockDog.repeatSound("A");
    expect(Mockit.spy(mockDog).callsTo("repeatSound").inTotal().length).toBe(1);
    mockDog.repeatSound("B");
    expect(Mockit.spy(mockDog).callsTo("repeatSound").inTotal().length).toBe(2);
    mockDog.repeatSound("A");

    expect(Mockit.spy(mockDog).callsTo("repeatSound").inTotal().length).toBe(3);
  });
});
