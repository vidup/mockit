import { Mockit } from "../../";
import { Person } from "../../test_utils/Person";

describe("Spy hasBeenCalled", () => {
    const mock = Mockit.mock2(Person);

    it("should be able to tell if a method has been called", () => {
        // const spy = Mockit.spy2(mock);
        // const methodSpy = spy.method("walk");
        // expect(methodSpy.hasBeenCalled()).toBeFalsy();
        // mock.walk();
        // expect(methodSpy.hasBeenCalled()).toBeTruthy();
    });
});