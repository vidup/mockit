import { Mockit } from "./mockit";

class Human {
    public walk(_val: string) {
      return "walking";
    }
  }

describe("Mockit > calls any", () => {
  it("should be able to mock a call with any string", () => {
    const mock = Mockit.mock(Human);

    Mockit.when(mock).calls("walk", [Mockit.any(String)]).thenReturn("dudette");

    const notStrings = [1, true, {}, []];
    notStrings.forEach((notString) => {
      // @ts-expect-error we passing something that is not a string
      expect(mock.walk(notString)).toBe("walking");;
    });

    expect(mock.walk("anything")).toBe("dudette");
  });
});
