import { mockInterface, when } from "../../mockit";

interface House {
  getRoomsCount(): number;
  getWindowsCount(): number;
}

describe("mockInterface", () => {
  it("should mock an interface", () => {
    const house = mockInterface<House>(["getRoomsCount"]);
    when(house.getRoomsCount).isCalled.thenReturn(3);

    expect(house.getRoomsCount()).toBe(3);

    // This will throw an error because the method is not mocked
    expect(() => house.getWindowsCount()).toThrowError(
      "house.getWindowsCount is not a function"
    );
  });
});
