import { Mockit } from "../..";
import { Person } from "../../test_utils/Person";

describe("Change function behaviour", () => {
  const mock = Mockit.mock(Person);

  it("should be able to make a function RETURN 42", () => {
    Mockit.when(mock).calls("walk").withArgs(1, 2, 3).thenReturn(42);

    // @ts-expect-error we are giving dumb arguments to match the mock
    expect(mock.walk(1, 2, 3)).toBe(42);
    checkDefaultBehaviourIsConserved(mock);
  });

  it("should be able to make a function RESOLVE 33", () => {
    Mockit.when(mock).calls("walk").withArgs(1, 2, 3).thenResolve(33);

    // @ts-expect-error we are giving dumb arguments to match the mock
    mock.walk(1, 2, 3)?.then((resolvedValue) => {
      expect(resolvedValue).toBe(33);
    });
    checkDefaultBehaviourIsConserved(mock);
  });

  it("should be able to make a function THROW an error", () => {
    Mockit.when(mock).calls("walk").withArgs(1, 2, 3).thenThrow("error");

    // @ts-expect-error we are giving dumb arguments to match the mock
    expect(() => mock.walk(1, 2, 3)).toThrow("error");
    checkDefaultBehaviourIsConserved(mock);
  });

  it("should be able to make a function REJECT an error", () => {
    Mockit.when(mock).calls("walk").withArgs(1, 2, 3).thenReject("REJECTED");

    // @ts-expect-error we are giving dumb arguments to match the mock
    mock.walk(1, 2, 3)?.catch((error) => {
      expect(error).toBe("REJECTED");
    });
    checkDefaultBehaviourIsConserved(mock);
  });

  it("should be able to make a function CALL a CALLBACK", () => {
    const callback = jest.fn();

    Mockit.when(mock).calls("walk").withArgs(1, 2, 3).thenCall(callback);

    // @ts-expect-error we are giving dumb arguments to match the mock
    mock.walk(1, 2, 3);

    expect(callback).toBeCalled();
    checkDefaultBehaviourIsConserved(mock);
  });
});

describe("Change function behaviour combined", () => {
  const mock = Mockit.mock(Person);
  Mockit.when(mock).calls("walk").withArgs(1, 2, 3).thenReturn(42);
  Mockit.when(mock).calls("walk").withArgs(4, 5, 6).thenResolve(33);
  Mockit.when(mock).calls("walk").withArgs(7, 8, 9).thenThrow("error");
  Mockit.when(mock).calls("walk").withArgs(10, 11, 12).thenReject("REJECTED");
  Mockit.when(mock)
    .calls("walk")
    .withArgs(13, 14, 15)
    .thenCall(() => {});

  it("should be able to combine different behaviours", () => {
    // @ts-expect-error we are giving dumb arguments to match the mock
    expect(mock.walk(1, 2, 3)).toBe(42);
    // @ts-expect-error we are giving dumb arguments to match the mock
    mock.walk(4, 5, 6)?.then((resolvedValue) => {
      expect(resolvedValue).toBe(33);
    });
    // @ts-expect-error we are giving dumb arguments to match the mock
    expect(() => mock.walk(7, 8, 9)).toThrow("error");
    // @ts-expect-error we are giving dumb arguments to match the mock
    mock.walk(10, 11, 12)?.catch((error) => {
      expect(error).toBe("REJECTED");
    });
    // @ts-expect-error we are giving dumb arguments to match the mock
    mock.walk(13, 14, 15);
    checkDefaultBehaviourIsConserved(mock);
  });
});

function checkDefaultBehaviourIsConserved(mock: Person) {
  expect(mock.walk()).toBeUndefined();
}
