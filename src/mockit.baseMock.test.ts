import { Mockit } from "./mockit";

class Human {
    public walk(_val?: any) {
        return "walking";
    }
}

describe("Mockit > baseMock", () => {
    it("should be able to call a mock with anything", () => {
        const mock = Mockit.mock2(Human);
        expect(mock.walk()).toBe(undefined);

        const args = [ 1, true, {}, [], "string", undefined, null ];
        args.forEach((notString) => {
            expect(mock.walk(notString)).toBe(undefined);
        });
    });
})