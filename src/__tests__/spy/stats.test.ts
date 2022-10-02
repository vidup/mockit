import { Mockit } from "../../mockit";
import { Person } from "../../test_utils/Person";
import { Call } from "../../types/call";

describe("Spy callsAnalysis", () => {
  it("should allow to return the total calls of a function", () => {
    const mock = Mockit.mock(Person);
    const walkSpy = Mockit.spy(mock).method("walk");

    expect(walkSpy.stats.calls.length).toBe(0);

    mock.walk();
    const firstExpectedCall: Call = {
      args: [],
      date: expect.any(String),
      key: expect.any(String),
      mockedBehaviour: expect.any(Function),
      previousCalls: [],
    };
    expect(walkSpy.stats.calls).toEqual([firstExpectedCall]);

    mock.walk(1);
    const secondExpectedCall: Call = {
      args: [1],
      date: expect.any(String),
      key: expect.any(String),
      mockedBehaviour: expect.any(Function),
      previousCalls: [firstExpectedCall],
    };
    expect(walkSpy.stats.calls).toEqual([
      firstExpectedCall,
      secondExpectedCall,
    ]);

    // @ts-expect-error - This is a test
    mock.walk(1, 2, 3, "hi");

    const thirdExpectedCall: Call = {
      args: [1, 2, 3, "hi"],
      date: expect.any(String),
      key: expect.any(String),
      mockedBehaviour: expect.any(Function),
      previousCalls: [firstExpectedCall, secondExpectedCall],
    };
    expect(walkSpy.stats.calls).toEqual([
      firstExpectedCall,
      secondExpectedCall,
      thirdExpectedCall,
    ]);
  });

  it("should allow to return the calls of a function with a specific set of arguments", () => {
    const mock = Mockit.mock(Person);
    const walkSpy = Mockit.spy(mock).method("walk");

    expect(walkSpy.stats.calls.length).toBe(0);

    mock.walk(1);
    mock.walk(1);
    mock.walk(1);

    expect(walkSpy.stats.callsWithArgs([1]).length).toBe(3);
    expect(walkSpy.stats.callsWithArgs([2]).length).toBe(0);

    mock.walk(2);
    expect(walkSpy.stats.callsWithArgs([1]).length).toBe(3);
    expect(walkSpy.stats.callsWithArgs([2]).length).toBe(1);
  });
});
