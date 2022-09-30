import { Mockit } from "../../mockit";
import { Person } from "../../test_utils/Person";

describe("Mockit > change default behaviour", () => {
    it("should return undefined by default", () => {
        const mock = Mockit.mock2(Person);
        expect(mock.walk()).toBe(undefined);
    
        const args = [1, true, {}, [], "string", undefined, null];
        args.forEach((arg) => {
          expect(mock.walk(arg)).toBe(undefined);
        });
      });

    it("should be able to RETURN 42 by default", () => {
        const mock = Mockit.mock2(Person, {
          defaultBehaviour: {
            behaviour: Mockit.Behaviours.Return,
            returnedValue: 42,
          },
        });

        expect(mock.walk()).toBe(42);
        expect(mock.run()).toBe(42);
    });


    it("should be able to RESOLVE 42 by default", () => {
        const mock = Mockit.mock2(Person, {
          defaultBehaviour: {
            behaviour: Mockit.Behaviours.Resolve,
            resolvedValue: 42,
          },
        });
    
        // @ts-expect-error we are testing the resolving mocked behaviour
        mock.walk()?.then((resolvedValue) => {
          expect(resolvedValue).toBe(42);
        });
    });

    it("should be able to REJECT an ERROR by default", () => {
        const mock = Mockit.mock2(Person, {
          defaultBehaviour: {
            behaviour: Mockit.Behaviours.Reject,
            rejectedValue: new Error("rejected"),
          },
        });
    
        // @ts-expect-error we are testing the rejecting mocked behaviour
        mock.walk()?.catch((rejectedValue) => {
          expect(rejectedValue).toStrictEqual(new Error("rejected"));
        });
    });

    
    it("should be able to THROW  by default", () => {
      const mock = Mockit.mock2(Person, {
        defaultBehaviour: {
          behaviour: Mockit.Behaviours.Throw,
          error: new Error("Nop"),
        },
      });

      expect(() => {
        mock.walk();
      }).toThrow("Nop");
  });

    it("should be able to CALL a CALLBACK by default", () => {
        let counter = 0;
        function increaseCounter() {
          counter++;
        }

        expect(counter).toBe(0);
    
        const mock = Mockit.mock2(Person, {
          defaultBehaviour: {
            behaviour: Mockit.Behaviours.Call,
            callback: increaseCounter,
          },
        });
    
        mock.walk();
        expect(counter).toBe(1);
    });
});
