import { Mockit } from "./mockit";

class Dog {
  makeSound(): void {}
}

describe("Mockit > thenThrow", () => {
  test("it should allow to set a custom throw message", () => {
    const mockDog = Mockit.mock(Dog);
    Mockit.when(mockDog).calls("makeSound", []).thenThrow("CROA ERROR!");

    expect(() => {
      mockDog.makeSound();
    }).toThrowError("CROA ERROR!");
  });

  test("it should allow to set a custom Error", () => {
    const mockDog = Mockit.mock(Dog);
    Mockit.when(mockDog)
      .calls("makeSound", [])
      .thenThrow(new Error("CROA ERROR 2!"));

    expect(() => {
      mockDog.makeSound();
    }).toThrowError("CROA ERROR 2!");
  });
});
