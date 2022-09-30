import { Mockit } from "../..";
import { Person } from "../../test_utils/Person";

describe("Change function behaviour", () => {
    const mock = Mockit.mock2(Person);

    it("should be able to make a function RETURN 42", () => {
        Mockit.when2(mock).calls("walk").withArgs(1, 2, 3).thenReturn(42);

        // @ts-expect-error we are giving dumb arguments to match the mock
        expect(mock.walk(1, 2, 3)).toBe(42);
    });

    it("should be able to make a function RESOLVE 33", () => {
        Mockit.when2(mock).calls("walk").withArgs(1, 2, 3).thenResolve(33);

        // @ts-expect-error we are giving dumb arguments to match the mock
        mock.walk(1, 2, 3)?.then((resolvedValue) => {
            expect(resolvedValue).toBe(33);
        });
    });

    it("should be able to make a function THROW an error", () => {
        Mockit.when2(mock).calls("walk").withArgs(1, 2, 3).thenThrow("error");

        // @ts-expect-error we are giving dumb arguments to match the mock
        expect(() => mock.walk(1, 2, 3)).toThrow("error");
    });

    it("should be able to make a function REJECT an error", () => {
        Mockit.when2(mock).calls("walk").withArgs(1, 2, 3).thenReject("REJECTED");

        // @ts-expect-error we are giving dumb arguments to match the mock
        mock.walk(1, 2, 3)?.catch((error) => {
            expect(error).toBe("REJECTED");
        });
    });

    it("should be able to make a function CALL a CALLBACK", () => {
        const callback = jest.fn();

        Mockit.when2(mock).calls("walk").withArgs(1, 2, 3).thenCall(callback);

        // @ts-expect-error we are giving dumb arguments to match the mock
        mock.walk(1, 2, 3);

        expect(callback).toBeCalled();
    })
});