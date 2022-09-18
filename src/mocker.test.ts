import { Mockit } from "./mocker";
import { Parser } from "./parser";

abstract class Animal {
  abstract makeSound(): string;
}

class Dog implements Animal {
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

describe("Mockit > thenReturn", () => {
  test("it should allow to replace a class function returned value", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
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
});

describe("Mockit > thenThrow", () => {
  test("it should allow to set a custom throw message", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    Mockit.when(mockDog).calls("makeSound", []).thenThrow("CROA ERROR!");

    expect(() => {
      mockDog.makeSound();
    }).toThrowError("CROA ERROR!");
  });

  test("it should allow to set a custom Error", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    Mockit.when(mockDog)
      .calls("makeSound", [])
      .thenThrow(new Error("CROA ERROR 2!"));

    expect(() => {
      mockDog.makeSound();
    }).toThrowError("CROA ERROR 2!");
  });
});

describe("Mockit > thenCall", () => {
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

describe("Mockit > thenResolve", () => {
  test("it should allow to set a custom promise response", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    Mockit.when(mockDog).calls("makeAsyncSound", []).thenResolve("CROAAA!");

    return mockDog.makeAsyncSound().then((result) => {
      expect(result).toBe("CROAAA!");
    });
  });
});

describe("Mockit > thenReject", () => {
  test("it should allow to set a custom promise rejection", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    Mockit.when(mockDog)
      .calls("makeAsyncSound", [])
      .thenReject(new Error("CROA ERROR 2!"));

    return mockDog.makeAsyncSound().catch((error) => {
      expect(error.message).toBe("CROA ERROR 2!");
    });
  });
});

describe("Mockit > Spying", () => {
  test("It should give information about the calls", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).callsTo("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    mockDog.repeatSound("A");

    const expectedFirstCall = {
      date: expect.any(String),
      args: ["A"],
      key: new Parser().hash(["A"]),
      mockedBehaviour: expect.any(Function),
      previousCalls: [],
    };
    expect(repeatSoundMethod.inTotal()).toEqual([expectedFirstCall]);

    mockDog.repeatSound("A");
    const expectedSecondCall = {
      date: expect.any(String),
      args: ["A"],
      key: new Parser().hash(["A"]),
      mockedBehaviour: expect.any(Function),
      previousCalls: [expectedFirstCall],
    };

    expect(repeatSoundMethod.inTotal()).toEqual([
      expectedFirstCall,
      expectedSecondCall,
    ]);
  });

  test("It should allow to access the function calls history for different sets of parameters", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    const repeatSoundCalls = Mockit.spy<Dog>(mockDog).callsTo("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    Mockit.when(mockDog).calls("repeatSound", ["B"]).thenReturn("CROAAA!");

    mockDog.repeatSound("A");
    mockDog.repeatSound("A");
    mockDog.repeatSound("A");

    expect(repeatSoundCalls.withArgs(["A"]).length).toBe(3);
    expect(repeatSoundCalls.withArgs(["B"]).length).toBe(0);

    mockDog.repeatSound("B");
    expect(repeatSoundCalls.withArgs(["B"]).length).toBe(1);
    expect(repeatSoundCalls.withArgs(["A"]).length).toBe(3);
  });

  test("It should also allow to access the whole function call history", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    const repeatSoundCalls = Mockit.spy<Dog>(mockDog).callsTo("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    Mockit.when(mockDog).calls("repeatSound", ["B"]).thenReturn("CROAAA!");

    mockDog.repeatSound("A");
    expect(repeatSoundCalls.inTotal().length).toBe(1);

    mockDog.repeatSound("B");
    expect(repeatSoundCalls.inTotal().length).toBe(2);

    mockDog.repeatSound("A");
    expect(repeatSoundCalls.inTotal().length).toBe(3);
  });

  test("It should also allow to check if a function has been called", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).method("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    expect(repeatSoundMethod.hasBeenCalled()).toBe(false);
    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalled()).toBe(true);
  });

  test("It should also allow to check if a function has been called with a specific set of parameters", () => {
    const mockDog = Mockit.mock<Dog>(Mockit.stub(Dog));
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).method("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    Mockit.when(mockDog).calls("repeatSound", ["B"]).thenReturn("CROBBB!");

    expect(repeatSoundMethod.hasBeenCalledWith(["A"])).toBe(false);
    expect(repeatSoundMethod.hasBeenCalledWith(["B"])).toBe(false);

    mockDog.repeatSound("A");

    expect(repeatSoundMethod.hasBeenCalledWith(["A"])).toBe(true);
    expect(repeatSoundMethod.hasBeenCalledWith(["B"])).toBe(false);
  });

  test("It should allow to check if a function has been called n times", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).method("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    expect(repeatSoundMethod.hasBeenCalledNTimes(0)).toBe(true);

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledNTimes(1)).toBe(true);

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledNTimes(2)).toBe(true);
  });

  it("It should allow to check if a function has been called with a specific set of parameters n times", () => {
    const mockDog = Mockit.mock(Mockit.stub(Dog));
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).method("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    Mockit.when(mockDog).calls("repeatSound", ["B"]).thenReturn("CROBBB!");
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["A"], 0)).toBe(true);
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["B"], 0)).toBe(true);

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["A"], 1)).toBe(true);
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["A"], 0)).toBe(false);
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["B"], 1)).toBe(false);
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["B"], 0)).toBe(true);

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["A"], 2)).toBe(true);
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["B"], 2)).toBe(false);
    expect(repeatSoundMethod.hasBeenCalledNTimesWith(["B"], 0)).toBe(true);
  });
});
