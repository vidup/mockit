import { Mockit } from "./mockit";

class Human {
  public walk(_val: string) {
    return "walking";
  }

  public count(_val: number) {
    return 1;
  }

  public takeBoolean(_val: boolean) {}

  public takeObject(_val: object) {}

  public takeDeepObject(_val: object) {}
}

describe("Mockit > any", () => {
  const mock = Mockit.mock(Human);
  const spy = Mockit.spy(mock);

  it("Calls checks for strings", () => {
    Mockit.when(mock).calls("walk", ["hellaw"]).thenReturn("dudette");
    mock.walk("hellaw");

    expect(spy.callsTo("walk").inTotal()).toHaveLength(1);

    expect(spy.method("walk").hasBeenCalledOnceWith(["hellaw"])).toBeTruthy();
    expect(
      spy.method("walk").hasBeenCalledOnceWith([Mockit.any(String)])
    ).toBeTruthy();

    mock.walk("hellaw");

    expect(spy.callsTo("walk").inTotal()).toHaveLength(2);
    expect(spy.method("walk").hasBeenCalledTwiceWith([Mockit.any(String)]));
  });

  it("Calls checks for numbers", () => {
    Mockit.when(mock).calls("count", [1]).thenReturn("dudette");
    mock.count(1);

    expect(spy.callsTo("count").inTotal()).toHaveLength(1);

    expect(spy.method("count").hasBeenCalledOnceWith([1])).toBeTruthy();
    expect(
      spy.method("count").hasBeenCalledOnceWith([Mockit.any(Number)])
    ).toBeTruthy();

    mock.count(1);

    expect(spy.callsTo("count").inTotal()).toHaveLength(2);
    expect(spy.method("count").hasBeenCalledTwiceWith([Mockit.any(Number)]));
  });

  it("Calls checks for booleans", () => {
    Mockit.when(mock).calls("takeBoolean", [true]).thenReturn("dudette");
    mock.takeBoolean(true);

    expect(spy.callsTo("takeBoolean").inTotal()).toHaveLength(1);

    expect(
      spy.method("takeBoolean").hasBeenCalledOnceWith([true])
    ).toBeTruthy();
    expect(
      spy.method("takeBoolean").hasBeenCalledOnceWith([Mockit.any(Boolean)])
    ).toBeTruthy();

    mock.takeBoolean(true);

    expect(spy.callsTo("takeBoolean").inTotal()).toHaveLength(2);
    expect(
      spy.method("takeBoolean").hasBeenCalledTwiceWith([Mockit.any(Boolean)])
    );
  });

  it("Calls checks for objects", () => {
    Mockit.when(mock)
      .calls("takeObject", [{ x: 1 }])
      .thenReturn("dudette");
    mock.takeObject({ x: 1 });

    expect(spy.callsTo("takeObject").inTotal()).toHaveLength(1);

    expect(
      spy.method("takeObject").hasBeenCalledOnceWith([{ x: 1 }])
    ).toBeTruthy();
    expect(
      spy.method("takeObject").hasBeenCalledOnceWith([Mockit.any(Object)])
    ).toBeTruthy();

    mock.takeObject({ x: 1 });

    expect(spy.callsTo("takeObject").inTotal()).toHaveLength(2);
    expect(
      spy.method("takeObject").hasBeenCalledTwiceWith([Mockit.any(Object)])
    );
  });

  it("should allow checks for deep object properties", () => {
    const obj = {
      name: "John",
      age: 30,
      address: {
        street: "Main Street",
        number: 123,
      },
      createdAt: new Date("2019-01-01").toISOString(),
    };
    Mockit.when(mock).calls("takeDeepObject", [obj]).thenReturn("dudette");

    expect(spy.callsTo("takeDeepObject").inTotal()).toHaveLength(0);

    mock.takeDeepObject(obj);

    expect(spy.callsTo("takeDeepObject").inTotal()).toHaveLength(1);

    expect(
      spy.method("takeDeepObject").hasBeenCalledOnceWith([obj])
    ).toBeTruthy();

    expect(
      spy.method("takeDeepObject").hasBeenCalledOnceWith([
        {
          name: Mockit.any(String),
          age: Mockit.any(Number),
          address: {
            street: Mockit.any(String),
            number: Mockit.any(Number),
          },
          createdAt: Mockit.any(String),
        },
      ])
    ).toBeTruthy();
  });
});
