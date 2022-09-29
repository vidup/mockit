import { Mockit } from "./mockit";

class Human {
  public walk(_val?: any) {
    return "walking";
  }
}

describe("Mockit > baseMock", () => {
  it("should be able to call a mock with anything and return undefined by default", () => {
    const mock = Mockit.mock2(Human);
    expect(mock.walk()).toBe(undefined);

    const args = [1, true, {}, [], "string", undefined, null];
    args.forEach((notString) => {
      expect(mock.walk(notString)).toBe(undefined);
    });
  });

  it("should be able to set the default behaviour of a mock", () => {
    const mock = Mockit.mock2(Human, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Throw,
        error: "error",
      },
    });

    expect(() => {
      mock.walk();
    }).toThrow("error");
  });

  it("should be able to set the default behaviour of a mock a resolve", () => {
    const mock = Mockit.mock2(Human, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Resolve,
        resolvedValue: "resolved",
      },
    });

    // @ts-expect-error we are testing the resolving mocked behaviour
    mock.walk()?.then((resolvedValue) => {
      expect(resolvedValue).toBe("resolved");
    });
  });

  it("should be able to set the default behaviour of a mock a reject", () => {
    const mock = Mockit.mock2(Human, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Reject,
        rejectedValue: "rejected",
      },
    });

    // @ts-expect-error we are testing the rejecting mocked behaviour
    mock.walk()?.catch((rejectedValue) => {
      expect(rejectedValue).toBe("rejected");
    });
  });

  it("should be able to set the default behaviour of a mock a return", () => {
    const mock = Mockit.mock2(Human, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Return,
        returnedValue: "returned",
      },
    });

    expect(mock.walk()).toBe("returned");
  });

  it("should be able to set the default behaviour of a mock with a callback", () => {
    let counter = 0;
    function increaseCounter() {
      counter++;
    }

    const mock = Mockit.mock2(Human, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Call,
        callback: increaseCounter,
      },
    });

    expect(counter).toBe(0);

    mock.walk();

    expect(counter).toBe(1);
  });
});
