import { Mockit } from "../../../mockit";

export function hello(...args: any[]) {}

describe("v2 spy.any.nTimes", () => {
  it("should work for atLeastOnce", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    expect(
      spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).atLeastOnce
    ).toBe(false);
    mock({ x: "hello" });
    expect(
      spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).atLeastOnce
    ).toBe(true);
    mock({ x: "hello" });
    mock({ x: "1" });
    expect(
      spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).atLeastOnce
    ).toBe(true);
  });

  it("should work for only once", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    mock({ x: "hello" });
    expect(spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).once).toBe(
      true
    );
    mock({ x: "hello" });
    expect(spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).once).toBe(
      false
    );
  });

  it("should work for twice", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    mock({ x: "hello" });
    expect(spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).twice).toBe(
      false
    );

    mock({ x: "hello" });
    expect(spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).twice).toBe(
      true
    );

    mock({ x: "hello" });
    expect(spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).twice).toBe(
      false
    );
  });

  it("should work for thrice", () => {
    const mock = Mockit.mockFunction(hello);
    const spy = Mockit.spy(mock);

    mock({ x: "hello" });
    mock({ x: "hello" });

    expect(spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).thrice).toBe(
      false
    );

    mock({ x: "hello" });

    expect(spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).thrice).toBe(
      true
    );

    mock({ x: "hello" });

    expect(spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).thrice).toBe(
      false
    );
  });

  for (const n of [1, 2, 3, 4, 7, 22]) {
    it(`should work for nTimes(${n})`, () => {
      const mock = Mockit.mockFunction(hello);
      const spy = Mockit.spy(mock);

      expect(
        spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).nTimes(n)
      ).toBe(false);

      for (let i = 0; i < n; i++) {
        mock({ x: "hello" });
      }

      expect(
        spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).nTimes(n)
      ).toBe(true);

      mock({ x: "hello" });

      expect(
        spy.hasBeenCalled.withArgs({ x: Mockit.any.string }).nTimes(n)
      ).toBe(false);
    });
  }
});
