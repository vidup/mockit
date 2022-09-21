import { Mockit } from "./mockit";
import { Parser } from "./parser";
import { Call } from "./types/call";

class Dog {
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

describe("Mockit > Spying", () => {
  test("It should give information about the calls", () => {
    const mockDog = Mockit.mock(Dog);
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).callsTo("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    mockDog.repeatSound("A");

    const expectedFirstCall: Call = {
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
    const mockDog = Mockit.mock(Dog);
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
    const mockDog = Mockit.mock(Dog);
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
    const mockDog = Mockit.mock(Dog);
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).method("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    expect(repeatSoundMethod.hasBeenCalled()).toBe(false);
    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalled()).toBe(true);
  });

  test("It should also allow to check if a function has been called with a specific set of parameters", () => {
    const mockDog = Mockit.mock<Dog>(Dog);
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
    const mockDog = Mockit.mock(Dog);
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).method("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");
    expect(repeatSoundMethod.hasBeenCalledNTimes(0)).toBe(true);

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledNTimes(1)).toBe(true);

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledNTimes(2)).toBe(true);
  });

  it("It should allow to check if a function has been called with a specific set of parameters n times", () => {
    const mockDog = Mockit.mock(Dog);
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

  test("It should provide syntactic helpers for 1, 2 and three times", () => {
    const mockDog = Mockit.mock(Dog);
    const repeatSoundMethod = Mockit.spy<Dog>(mockDog).method("repeatSound");

    Mockit.when(mockDog).calls("repeatSound", ["A"]).thenReturn("CROAAA!");

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledOnce()).toBe(true);
    expect(repeatSoundMethod.hasBeenCalledTwice()).toBe(false);
    expect(repeatSoundMethod.hasBeenCalledThrice()).toBe(false);

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledOnce()).toBe(false);
    expect(repeatSoundMethod.hasBeenCalledTwice()).toBe(true);
    expect(repeatSoundMethod.hasBeenCalledThrice()).toBe(false);

    mockDog.repeatSound("A");
    expect(repeatSoundMethod.hasBeenCalledOnce()).toBe(false);
    expect(repeatSoundMethod.hasBeenCalledTwice()).toBe(false);
    expect(repeatSoundMethod.hasBeenCalledThrice()).toBe(true);
  });
});
