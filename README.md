[![Wallaby.js](https://img.shields.io/badge/wallaby.js-powered-blue.svg?style=flat&logo=github)](https://wallabyjs.com/oss/)

Mockit solves the problem of [mocking the behaviour](https://martinfowler.com/articles/mocksArentStubs.html) of injected dependencies in Typescript.

It gives you access to a simple API to mock functions, classes and even abstract classes, so that any type of dependency can be mocked with minimum effort and maximum flexibility.

You can then setup the behaviour of your mocks, make suppositions on how they will be called and verify that they were called as expected.

Finally, you can leverage the power of the [Zod](https://github.com/colinhacks/zod) library's schemas to make make assertions on the nature of the objects passed to your mocks.

Feel free to contribute :)

## Mocking should be easy

Until now, I found that mocking dependencies in Typescript is a bit of a pain: you're often forced to build complete fake implementations of your dependencies, which can be a bit tedious, especially as they grow more complex.

**It is fragile when change occurs**. Extending the signature of a module (like adding another method to a class) should not force you to correct your mocks one by one. Or worse, to use `@ts-ignore` and `@ts-expect-error` everywhere.

With Mockit, it's as easy as a function call.

```ts
import { mockFunction } from "@vdcode/mockit";

class Hi {
  public sayHi() {
    return "hi";
  }
}
const hiMock = mock(Hi);

function hello() {
  return "hello";
}
const helloMock = mockFunction(hello);

abstract class Hola {
  public abstract sayHello(): string;
  public abstract sayHi(): string;
  public abstract sayHola(): string;
}
const holaMock = mockAbstract(Hello, ["sayHola"]); // Mockit will help you by hinting you with the names of the abstract methods of your class, using generics to catch the type of the class you pass as the first parameter.
```

For TypeScript compiler, hiMock is an instance of Hi, and helloMock is a function with the same signature as hello.
Except they can now be spied on, and their behaviour can be changed at will.

## Mocking should be semantic

Reading test code often happens when you broke it, and chances are high that you're not the one who wrote it: Mockit's API is designed to be as semantic as possible, so that you can easily understand what the test is about.

```ts
import { mockFunction, when } from "@vdcode/mockit";

function log(anything: string): void {
  // ...
}
function broadCast(anything: string): void {
  // ...
}

function sendMessage(
  message: string,
  {
    logger,
    broadcaster,
  }: {
    logger: (x: string) => void;
    broadcaster: (x: string) => void;
  }
): void {
  try {
    logger(`Sending message "${message}"`);
    broadcaster(message);
    logger(`Message "${message}" sent`);
  } catch (err) {
    logger(`Error while sending message "${message}"`);
  }
}

// test file
it("should log the error message if broadcast failed", () => {
  const logMock = mockFunction(log);
  const broadcastMock = mockFunction(broadCast);

  when(broadCastMock).isCalled.thenThrow();

  suppose(logMock).willBeCalledWith("Sending message hello");
  suppose(logMock).willBeCalledWith("Error while sending message hello");

  sendMessage("hello", { logger: logMock, broadcaster: broadcastMock });

  verify(logMock);
});
```

## Mocking should not lock you in

Changing all my mocks when switching from `jest` to `vitest`, `mocha`, `ava`, `cypress` or `playwright` is _not_ something I'm a fan of. You can use Mockit with any test runner, effectively making your test code agnostic of the test runner you use, as far as mocking is concerned.

## TypeScript testing is hard

Testing with TypeScript is harder than with JavaScript: you have to deal with types, and that can sometimes be slowing you down. Mockit is designed from scratch to be used with TypeScript, and tricks the compiler to make it believe that your mocks are the real thing (under the hood, Mockit uses Proxies objects).
It embraces one of TypeScript's best libraries, Zod, to help you make assertions on the nature of the objects passed to your mocks.

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

To do that, you can use the `isCalledWith(...args)` helper, which takes the same arguments as the mocked function, and then set the behaviour you want.

At that point the API is the same as the default behaviour.

```ts
function hello(...args: any[]) {}
const mock = Mockit.mockFunction(hello);

Mockit.when(mock).isCalledWith("hiii").thenReturn("hiii");
Mockit.when(mock).isCalledWith("hello").thenReturn("hello");
Mockit.When(mock).isCalledWith("please throw").thenThrow(new Error("hiii"));

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

## Has the function been called?

You can check if the mocked function has been called called with a few helpers Mockit provides. Except for `nTimes`, all of these helpers are getters, so you can use them as boolean values. This prevents false positives when using them in weak asserting functions, depending on the library you use.

```ts
function hello(...args: any[]) {}

const mock = Mockit.mockFunction(hello);
const spy = Mockit.spy(mock);

mock("hiii");

spy.hasBeenCalled.once; // true
spy.hasBeenCalled.twice; // false
spy.hasBeenCalled.atLeastOnce; // true
spy.hasBeenCalled.thrice; // false
spy.hasBeenCalled.nTimes(1); // true

mock("hello");

spy.hasBeenCalled.once; // false
spy.hasBeenCalled.twice; // true
spy.hasBeenCalled.atLeastOnce; // true
spy.hasBeenCalled.thrice; // false
spy.hasBeenCalled.nTimes(2); // true

mock("please throw");

spy.hasBeenCalled.once; // false
spy.hasBeenCalled.twice; // false
spy.hasBeenCalled.atLeastOnce; // true
spy.hasBeenCalled.thrice; // true
spy.hasBeenCalled.nTimes(3); // true
```

## Has the function been called with specific arguments?

You can also check if the mocked function has been called with specific arguments. To do that, you just need to chain the `withArgs(...args)` helper, which takes the same arguments as the mocked function.
From there, you can use the same helpers as above.

```ts
function hello(...args: any[]) {}

const mock = Mockit.mockFunction(hello);
const spy = Mockit.spy(mock);

spy.hasBeenCalled.withArgs("hiii").once; // false
spy.hasBeenCalled.withArgs("hiii").twice; // false
spy.hasBeenCalled.withArgs("hiii").atLeastOnce; // false
spy.hasBeenCalled.withArgs("hiii").thrice; // false
spy.hasBeenCalled.withArgs("hiii").nTimes(1); // false

mock("hiii");

spy.hasBeenCalled.withArgs("hiii").once; // true
spy.hasBeenCalled.withArgs("hiii").twice; // false
spy.hasBeenCalled.withArgs("hiii").atLeastOnce; // true
spy.hasBeenCalled.withArgs("hiii").thrice; // false
spy.hasBeenCalled.withArgs("hiii").nTimes(1); // true

// etc...
```

# Suppose and Verify

Mockit exposes two helpers that allow you to write tests in a more natural way:

- `suppose` allows you to set expectations on a mocked function
- `verify` allows you to check if the expectations you set have been met, all at once, with one function call.

## Basic usage

You can create suppositions with any arguments you want.
Once all your suppositions have been created, you can call `verify` to check if they have been met.

```ts
import { mockFunction, suppose, verify } from "mockit";
function hello(...args: any[]) {}

test("it should be called three times, 'hello' twice and 'hiii' once", () => {
  const mock = mockFunction(hello);
  suppose(mock).willBeCalledWith("hiii").once;
  suppose(mock).willBeCalledWith("hello").twice;
  suppose(mock).willBeCalled.thrice;

  mock("hiii");

  expect(() => verify(mock)).toThrow(); // only one supposition is met
  mock("hello");
  expect(() => verify(mock)).toThrow(); // the second supposition requires another call with "hello"
  mock("hello");
  verify(mock); // all suppositions are met
});
```

## Usage with Zod

You can use any Zod schema to create suppositions.
This allows you to check if the mocked function has been called with specific types of arguments, or even with arguments that match a specific schema.
You can also check that a mock has not been called.

```ts
import { mockFunction, suppose, verify } from "mockit";
import { z } from "zod";

function registerAdultAccount(...args: any[]) {}
function registerMinorAccount(...args: any[]) {}
const adultSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive().min(18),
});

const minorSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive().max(17),
});

function createAccount(
  user: z.infer<typeof adultSchema | typeof minorSchema>,
  registry: {
    createAdult: typeof registerAdultAccount;
    createMinor: typeof registerMinorAccount;
  }
) {
  if (user.age < 18) {
    return registry.createAdult(user);
  }

  return registry.createMinor(user);
}

it("should only call minor registration if user is minor", () => {
  const adultRegistrationMock = mockFunction(registerAdultAccount);
  const minorRegistrationMock = mockFunction(registerMinorAccount);
  suppose(minorRegistrationMock).willBeCalledWith(minorSchema).once;
  suppose(adultRegistrationMock).willNotBeCalled();

  createAccount(
    { uuid: "123", name: "John", email: "hii@gmail.com", age: 17 },
    { createAdult: adultRegistrationMock, createMinor: minorRegistrationMock }
  );

  verify(minorRegistrationMock);
  verify(adultRegistrationMock);
});

it("should only call adult registration if user is adult", () => {
  const adultRegistrationMock = mockFunction(registerAdultAccount);
  const minorRegistrationMock = mockFunction(registerMinorAccount);
  suppose(minorRegistrationMock).willNotBeCalled();
  suppose(adultRegistrationMock).willBeCalledWith(adultSchema).once;

  createAccount(
    { uuid: "123", name: "John", email: "adult@gmail.com", age: 18 },
    { createAdult: adultRegistrationMock, createMinor: minorRegistrationMock }
  );

  verify(adultRegistrationMock);
  verify(minorRegistrationMock);
});
```

---

# Zod integration with spies

We believe that [Zod](https://github.com/colinhacks/zod) is a game changer when it comes to validating data (and more).
Mockit integrates with Zod to provide you with a powerful way to check if your mocked functions have been called with specific arguments.

This means you can not only check if a function has been called with a specific set of argument, but also:

- with a specific type of argument
- with arguments that match a specific zod schema.

Here are a few examples:

```ts
function hello(...args: any[]) {}

const mock = Mockit.mockFunction(hello);
const spy = Mockit.spy(mock);

// String
spy.hasBeenCalled.withArgs(Mockit.any.string).once; // false
mock("hiii");
spy.hasBeenCalled.withArgs(Mockit.any.string).once; // true

// Email
spy.hasBeenCalled.withArgs(Mockit.any.string.email()).once; // false
mock("gracehopper@gmail.com");
spy.hasBeenCalled.withArgs(Mockit.any.string.email()).once; // true

// Uuid
spy.hasBeenCalled.withArgs(Mockit.any.string.uuid()).once; // false
mock("a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6");
spy.hasBeenCalled.withArgs(Mockit.any.string.uuid()).once; // true

// Negative number
spy.hasBeenCalled.withArgs(Mockit.any.number.negative()).once; // false
mock(-1);
spy.hasBeenCalled.withArgs(Mockit.any.number.negative()).once; // true

// Positive number
spy.hasBeenCalled.withArgs(Mockit.any.number.positive()).once; // false
mock(1);
spy.hasBeenCalled.withArgs(Mockit.any.number.positive()).once; // true

// Number between 10 and 20
spy.hasBeenCalled.withArgs(Mockit.any.number.min(10).max(20)).once; // false
mock(15);
spy.hasBeenCalled.withArgs(Mockit.any.number.min(10).max(20)).once; // true

// Array of strings
spy.hasBeenCalled.withArgs(Mockit.any.array(Mockit.any.string)).once; // false
mock([1, 2, 3]);
spy.hasBeenCalled.withArgs(Mockit.any.array(Mockit.any.string)).once; // false
mock(["1", "2", "3"]);
spy.hasBeenCalled.withArgs(Mockit.any.array(Mockit.any.string)).once; // true
```

These are just a few basic examples, but you can user any zod schema. For more information I highly recommend that you check out the [Zod documentation](https://zod.dev/).

The API might change (I believe it should just accept a plan zod schema instead of exposing Mockit.z).

# Next up

A great feature I want to implement is to be able to setup a behaviour based on a Zod schema. Kindof the equivalent of what Mockit allows with spies.

```ts
// IDEA ONLY: THIS IS NOT AVAILABLE
function hello(...args: any[]) {}

const mock = Mockit.mock(hello);
Mockit.when(mock).isCalledWith(z.schema({
  name: z.string(),
  email: z.email(),
  age: z.number().min(18)
})).thenReturn("major");

Mockit.when(mock).isCalledWith(z.schema({
  name: z.string(),
  email: z.email(),
  age: z.number().max(18)
}).thenReturn("minor");
```

- [x] I also want to implement a `verify` API directly with the mock, so that you can do something like: (IT WORKS \o/)

```ts
// IDEA ONLY: THIS IS NOT AVAILABLE
function hello(...args: any[]) {}

const mock = Mockit.mock(hello);
suppose(mock).willBeCalledWith(
  z.schema({
    name: z.string(),
    email: z.email(),
    age: z.number().min(18),
  })
).once;

verify(mock); // this would throw and provide a nice error message
```
