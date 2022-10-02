import { Mockit } from "../../mockit";
import { Person } from "../../test_utils/Person";

describe("Function default behaviour", () => {
  it("should be able to set a specific function basic behaviour", () => {
    const mock = Mockit.mock(Person, {
      defaultBehaviour: { behaviour: Mockit.Behaviours.Throw },
    });

    expect(() => mock.walk()).toThrow();

    Mockit.when(mock).calls("walk").thenReturn("hello");

    expect(mock.walk()).toBe("hello");

    Mockit.when(mock).calls("walk").withArgs(1).thenReturn("A");

    expect(mock.walk(1)).toBe("A");
    expect(mock.walk()).toBe("hello");
    expect(mock.walk(1111111111111)).toBe("hello");
  });

  it("should be able to do the same for throw", () => {
    const mock = Mockit.mock(Person);

    Mockit.when(mock).calls("walk").thenThrow("hello");
    expect(() => mock.walk()).toThrow("hello");

    // Mock for a specific arg and check it
    Mockit.when(mock).calls("walk").withArgs(1).thenThrow("A");
    expect(() => mock.walk(1)).toThrow("A");

    // keep checking the default behaviour
    expect(() => mock.walk()).toThrow("hello");
    expect(() => mock.walk(1111111111111)).toThrow("hello");
  });

  it("should be able to do the same for promise rejection", () => {
    // expect.assertions(4);
    const mock = Mockit.mock(Person);

    Mockit.when(mock).calls("asyncRun").thenReject(new Error("hiii"));

    expect(() => mock.asyncRun()).rejects.toStrictEqual(new Error("hiii"));

    // Change the behaviour for a specific argument and check it
    Mockit.when(mock).calls("asyncRun").withArgs(1).thenReject("A");
    expect(() => mock.asyncRun(1)).rejects.toStrictEqual("A");

    // keep checking the default behaviour
    expect(() => mock.asyncRun()).rejects.toStrictEqual(new Error("hiii"));
    expect(() => mock.asyncRun(1111111111111)).rejects.toStrictEqual(
      new Error("hiii")
    );
    expect(() => mock.asyncRun("walou")).rejects.toStrictEqual(
      new Error("hiii")
    );
  });

  it("should be able to do the same for promise resolve", () => {
    // expect.assertions(4);
    const mock = Mockit.mock(Person);

    Mockit.when(mock).calls("asyncRun").thenResolve("hiii");

    expect(mock.asyncRun()).resolves.toEqual("hiii");

    // Change the behaviour for a specific argument and check it
    Mockit.when(mock).calls("asyncRun").withArgs(1).thenResolve("A");
    expect(mock.asyncRun(1)).resolves.toEqual("A");

    // keep checking the default behaviour
    expect(mock.asyncRun(1)).resolves.toEqual("A");
    expect(mock.asyncRun(1111111111111)).resolves.toEqual("hiii");
    expect(mock.asyncRun("walou")).resolves.toEqual("hiii");
  });

  it("should be able to do the same for a callback", () => {
    let counter = 0;
    function increaseCounter() {
      counter++;
    }

    function decreaseCounter() {
      counter--;
    }

    const mock = Mockit.mock(Person);

    Mockit.when(mock).calls("asyncRun").thenCall(increaseCounter);

    expect(counter).toBe(0);
    mock.asyncRun();
    expect(counter).toBe(1);

    // Change the behaviour for a specific argument and check it
    Mockit.when(mock).calls("asyncRun").withArgs(1).thenCall(decreaseCounter);
    mock.asyncRun(1);

    expect(counter).toBe(0);

    // keep checking the default behaviour
    mock.asyncRun();
    expect(counter).toBe(1);
    mock.asyncRun(1111111111111);
    expect(counter).toBe(2);
    mock.asyncRun("walou");
    expect(counter).toBe(3);

    mock.asyncRun(1);
    expect(counter).toBe(2);
  });
});
