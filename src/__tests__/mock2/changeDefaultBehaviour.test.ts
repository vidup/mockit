import { Mockit } from "../../";
import { Person } from "../../test_utils/Person";

describe("Change default behaviour", () => {
    it("should be able to change the default behaviour of a mock", () => {
        const mock = Mockit.mock2(Person, {
            defaultBehaviour: {
                behaviour: Mockit.Behaviours.Throw,
                error: "error",
            }
        });

        expect(() => {
            mock.walk();
        }).toThrow("error");
        
        Mockit.changeDefaultBehaviour(mock, {
            behaviour: Mockit.Behaviours.Return,
            returnedValue: "returned",
        });

        expect(mock.walk()).toBe("returned");
    });
});