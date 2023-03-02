DISCLAIMER: This readme is for the V1 version which is not published yet.

This is a fun little experiment I'm doing to build a lightweight Mokito inspired mocking library.

[![Wallaby.js](https://img.shields.io/badge/wallaby.js-powered-blue.svg?style=flat&logo=github)](https://wallabyjs.com/oss/)

For now it's functional and allows you to mock classes methods, altering their behaviour with default and args specific mocks.
It also allows you to spy on these methods and analyze their calls.

It gives you access to helpers to mock and spy functions, classes and abstract classes (even their abstract methods !).

This is a work in progress and is subject to change completely and breakingly. Feel free to contribute though.

# Philosophy

The idea behind this library is to provide a simple way to mock and spy injected dependencies in your code.
I'm a big fan of dependency injection as a way to write testable code. In Typescript it's as easy as passing them as function parameters.

However, I found that mocking dependencies in Typescript is a bit of a pain: you're often forced to build fake implementations of your dependencies, which can be a bit tedious, especially as they grow more complex.

Sadly, I found the mocking ecosystem either too heavy (like the great `ts-mockito` package, sadly not that much maintained anymore) or too framework specific ( `jest` utilities like `mockImplementationOnce`, `mockReturnValueOnce`, `fn()`, `spyOn()`, etc.);

I wanted something that was semantic, easy to use, and independent of any test runner framework too. Changing all my tests when switching from `jest` to `vitest` or `ava` is _not_ something I'm a fan of.

DISCLAIMER: I'm trying to keep this library as lightweight as possible. I'm not trying to port Mokito: the `ts-mockito` library already did that way better than I could ever do. If you what you're after is a Mokito port, I suggest you use that library instead.

# Mocks

You can mock three things with Mockit:

- Functions
- Classes
- Abstract classes

## Mocking functions

You can generate a mocked version of any functions with the `mockFunction` helper. It will return a function that returns undefined by default (you can change that behaviour though, cf below).

```ts
import { Mockit } from "@vdcode/mockit";
function hello() {
  return "hello";
}

const mock = Mockit.mockFunction(hello);
```

## Mocking classes

To generate a class mock, you can use the `mock` helper. It will return a `ClassMock` instance, which is a dummy class with the same methods as the class you passed as parameter. All these methods will return `undefined` by default (you can change that behaviour though, cf below).

```ts
import { Mockit } from "@vdcode/mockit";
class Hello {
  public sayHello() {
    return "hello";
  }
}

const mock = Mockit.mock(Hello);
```

## Mocking abstract classes

This is where things get interesting. You can mock abstract classes with the `mockAbstract` helper. It will return a `AbstractClassMock` instance, which is a dummy class. By default, this instance has no methods, because we cannot access abstract methods dynamically from JavaScript code (remember, **abstract methods are types**).

To solve this issue, `mockAbstract` requires a second parameter, which is an array of strings, containing the names of the abstract methods you want to mock. Mockit will help you by hinting you with the names of the abstract methods of your class, using generics. You don't need to specify the generic type manually, it will be inferred from the class you pass as the first parameter.

This is a **really** convenient feature when you need to test a function that depends on types, but you don't want to implement the whole interface in your test: use abstract classes instead of types or interfaces and you'll be able to mock them using Mockit.

```ts
import { Mockit } from "@vdcode/mockit";
abstract class Hello {
  public abstract sayHello(): string;
}

function useCase(params, deps: { hello: Hello }) {
  return deps.hello.sayHello();
}

test("should compile", () => {
  const mock = Mockit.mockAbstract(Hello, ["sayHello"]);
  const result = useCase({}, { hello: mock });
});
```

# Set default behaviour

Mockit's mocks default behaviour is to return `undefined`.
You can change this behaviour leveraging the `Mockit.when` helper. This helper takes any mocked function as a parameter, and can then be used with either:

- A function mock
- Any class mock's method
- Any abstract class mock's method

You can currently set the following behaviours:

- Return any value
- Throws any value
- Resolve any value
- Reject any value
- Call any callback function

```ts
function hello(...args: any[]) {}
const mock = Mockit.mockFunction(hello);

mock(); // undefined

Mockit.when(mock).isCalled.thenReturn("hiii");
mock(); // "hiii"

Mockit.when(mock).isCalled.thenThrow(new Error("hiii"));
mock(); // throws Error("hiii")

Mockit.when(mock).isCalled.thenResolve("hiii");
mock(); // Promise.resolves("hiii");

Mockit.when(mock).isCalled.thenReject(new Error("hiii"));
mock(); // Promise.rejects(Error("hiii"));

Mockit.when(mock).isCalled.thenCall((...args) => {
  console.log(args);
});
mock("hiii"); // logs ["hiii"]
```

# Set behaviour for specific arguments

You can also set a specific behaviour for a specific set of arguments. This is useful when you want to test a function that has different behaviours depending on the arguments it receives.

To do that, you can chain the `isCalled.withArgs(...args)` helper, which takes the same arguments as the mocked function, and then set the behaviour you want.

At that point the API is the same as the default behaviour.

```ts
function hello(...args: any[]) {}
const mock = Mockit.mockFunction(hello);

Mockit.when(mock).isCalled.withArgs("hiii").thenReturn("hiii");
Mockit.when(mock).isCalled.withArgs("hello").thenReturn("hello");
Mockit.When(mock)
  .isCalled.withArgs("please throw")
  .thenThrow(new Error("hiii"));

mock("hiii"); // "hiii"
mock("hello"); // "hello"
mock("please throw"); // throws Error("hiii")
```

# Spies

Mockit also provides a `spy` helper which you can use on any of its mocked functions. This helper will give you access to all the calls made on the mocked function, as well as syntactic sugar to check how many times the function has been called, with which arguments, etc.

It also integrates with the amazing Zod library via the `Mockit.any` port, effectively giving you the whole power of Zod's validation system to check if the mocked function has been called with extremely specific arguments.

## Calls

You can access the list of calls made on the mocked function with the `calls` property.
These calls follow the following interface:

```ts
interface Call {
  /**
   * The arguments passed to the mocked function when it was called.
   */
  args: any[];
  /**
   * The behaviour that was set for this call.
   * This includes the eventual:
   * - returnedValue
   * - error
   * - resolvedValue
   * - rejectedValue
   * - callback
   */
  behaviour: Behaviour;
}
```

Here's an example of how you can use the `calls` property:

```ts
function hello(...args: any[]) {}
const mock = Mockit.mockFunction(hello);
const spy = Mockit.spy(mock);

mock("hiii");
mock("hello");
mock("please throw");

spy.calls.length; // 3
spy.calls[0].args; // ["hiii"]
spy.calls[1].args; // ["hello"]
spy.calls[2].args; // ["please throw"]

// TODO: add behaviour examples since they're returned too
```

```ts
import { Mockit } from "@vdcode/mockit";

class MyClass {
  public sum(a: number, b: number): number {
    return a + b;
  }

  public multiply(a: number, b: number): number {
    return a * b;
  }

  public async asyncSum(a: number, b: number): Promise<number> {
    return a + b;
  }
}

const myClassMock = Mockit.mock(MyClass);
```

### Default behaviour

By default, the mock will return `undefined` for each call on the functions of your class.

### Set default behaviour on instanciation

You can set a different default behaviour when you instanciate a mock.
Mocks can either:

- Return (default behaviour)
- Throw
- Resolve
- Reject
- Call a callback

```ts
const throwingMock = Mockit.mock(MyClass, {
  defaultBehaviour: {
    behaviour: Mockit.behaviours.Throw,
    error: new Error("hiii"),
  },
});

const rejectingMock = Mockit.mock(MyClass, {
  defaultBehaviour: {
    behaviour: Mockit.behaviours.Reject,
    rejectedValue: new Error("rejected"),
  },
});

const resolvingMock = Mockit.mock(MyClass, {
  defaultBehaviour: {
    behaviour: Mockit.behaviours.Resolve,
    resolvedValue: "hii",
  },
});

const callBackMock = Mockit.mock(MyClass, {
  defaultBehaviour: {
    behaviour: Mockit.behaviours.Callback,
    callback: () => {
      console.log("hiii");
    },
  },
});
```

### Change default behaviour dynamically

You can also change the default behaviour of a mock dynamically.

```ts
// This mock will throw on all its functions
const mock = Mockit.mock(Person, {
  defaultBehaviour: {
    behaviour: Mockit.Behaviours.Throw,
    error: "error",
  },
});

try {
  mock.walk();
} catch (err) {
  // will throw and come here
}

// it will now return by default from here
Mockit.changeDefaultBehaviour(mock, {
  behaviour: Mockit.Behaviours.Return,
  returnedValue: "returned",
});

const result = mock.walk(); // "returned"
```

### Function default behaviour

You can change the behaviour of a specific function of your mock, while maintaining a global default behaviour for the others function of a mock. This can be useful if the dependency you're injecting is used multiples times in your module and you need fine grained behaviour (like passing some initial check).

You have access to helpers for each behaviour:

```ts
const mock = Mockit.mock(Person);
Mockit.when(mock).calls("walk").thenReturn("hiii");
Mockit.when(mock).calls("walk").thenResolve("hiii");
Mockit.when(mock).calls("walk").thenReject(new Error("hellaw"));
Mockit.when(mock).calls("walk").thenThrow(new Error("hellaw"));
Mockit.when(mock)
  .calls("walk")
  .thenCallback(() => console.log("hiii"));
```

Note that in Typescript you get auto-completion of your original class methods.

### Function custom behaviour with specific arguments

**Mockit** also allows you to change the behaviour of a function based on the arguments passed to it. This is useful if you want to test more complex scenarios.

```ts
const mock = Mockit.mock(Person);

Mockit.when(mock).calls("walk").withArgs(1, 2, 3).thenReturn("hiii");

Mockit.when(mock).calls("walk").withArgs({ x: 1 }).thenThrow(new Error("Nop"));

mock.walk(1, 2, 3); // "hiii"
mock.walk({ x: 1 }); // throws an error
```

You get access to the same helpers as those for the default behaviour.

### Example

```ts
// naive useCase: should throw if token is invalid, or return user data
function getUserData(
  { userUuid: string, credentials: { token: string } },
  userService: UserService
): Promise<User> {
  if (!userService.isTokenValid(token)) {
    throw new Error("Invalid token");
  }

  return userService.getUser(userUuid);
}

// test
describe("Protection", () => {
  it("should protect against bad tokens", () => {
    const userServiceMock = Mockit.mock(UserService, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Return,
        returnedValue: false,
      },
    });
    const userUuid = "userUuid";

    expect(() =>
      getUserData(
        { userUuid, credentials: { token: "token" } },
        userServiceMock
      )
    ).toThrowError("Invalid token");
  });

  it("should return user data", async () => {
    const userServiceMock = Mockit.mock(UserService, {
      defaultBehaviour: {
        behaviour: Mockit.Behaviours.Return,
        returnedValue: true,
      },
    });
    const userUuid = "userUuid";
    const user = { uuid: userUuid };

    Mockit.when(userServiceMock)
      .calls("getUser")
      .withArgs(userUuid)
      .thenResolve(user);

    const result = await getUserData(
      { userUuid, credentials: { token: "token" } },
      userServiceMock
    );

    expect(result).toEqual(user);
  });
});
```

# Spies

## Raw

**Mockit** also allows you to spy on each of your mocks functions.
This is useful if you want to test more complex scenarios as well as debug your tests.

```ts
const mock = Mockit.mock(Person);
const spy = Mockit.spy(mock); // register the spy on the mock
```

Note that once a spy is registered to your mock, you can keep using it: it will update itself with each new call.

There are two main ways to use Mockit's spies:

### Using a `MethodAsserter` instane.

You get access to a few helper functions and booleans:

```ts
const walkSpy = spy.method("walk"); // MethodAsserter instance

// Booleans
walkSpy.hasBeenCalled;
walkSpy.hasBeenCalledWithOnce;
walkSpy.hasBeenCalledWithTwice;
walkSpy.hasBeenCalledWithThrice;

// Basic helpers
walkSpy.hasBeenCalledWith(...args: any[]);
walkSpy.hasBeenCalledNTimesWith(args: any[], times: number);

// Combined helpers
walkSpy.hasBeenCalledOnceWith(args: any[]);
walkSpy.hasBeenCalledTwiceWith(args: any[]);
walkSpy.hasBeenCalledThriceWith(args: any[]);
```

These helper functions can receive a special argument: `Mockit.any`.
This is very useful if you don't care about the exact value of an argument, but only that it has been called with it.
A classic example of this is when a creation function returns an UUID, or a dynamic timestamp.

```ts
const mock = Mockit.mock(Person);
const walkSpy = Mockit.spy(mock).method("walk");
mock.walk(
  new Date().valueOf(),
  new Date().toISOString(),
  new Date(),
  Math.random(),
  { x: 1 },
  [1, 2, 3]
);

walkSpy.hasBeenCalledWith(
  Mockit.any(Number),
  Mockit.any(String),
  Mockit.any(Object),
  Mockit.any(Number),
  Mockit.any(Object),
  Mockit.any(Array)
);
```

### Raw calls analysis

You can access the history of the calls made to a function of your mock.
You can either get the total calls or the calls with specific arguments.

For now you cannot get the calls made with Mockit.any, but that's something I'm considering working on in the future.

Example:

```ts
const mock = Mockit.mock(Person);
// register the the mock to the spy
const spy = Mockit.spy(myClassMock);

// ... your test code

// get the all the calls
const calls = spy.callsTo("walk").inTotal();

// get the calls with specific arguments
const callsFor1And2 = spy.callsTo("walk").withArgs(1, 2);
```

These calls are objects of type Call.

```ts
export type Call = {
  args: any[];
  key: string;
  date: string; // ISO string
  mockedBehaviour: Function; // the mocked behaviour
  previousCalls: Call[];
};
```

You can use these calls for analysis, or to check that you mocked correctly with the `mockedBehaviour` key, which is effectively the mock that was executed at the time of the call.
