[![Wallaby.js](https://img.shields.io/badge/wallaby.js-powered-blue.svg?style=flat&logo=github)](https://wallabyjs.com/oss/)

DISCLAIMER: This readme is for the V1 beta version.

Mockit is a little experiment to help build mocked versions of functions, classes and abstract classes in TypeScript. It's inspired by Java's Mockito, although quite different in usage.

The idea behind this library is to provide a simple way to mock and spy injected dependencies in your code.
I'm a big fan of dependency injection as a way to write testable code. In Typescript it's as easy as passing them as function parameters.

However, I found that mocking dependencies in Typescript is a bit of a pain: you're often forced to build fake implementations of your dependencies, which can be a bit tedious, especially as they grow more complex. It's fragile when change occurs. Changing the original signature (like adding another method to a class) forces you to correct your mocks one by one, or worse, use `@ts-ignore` and `@ts-expect-error` everywhere).
I needed something that was semantic, easy to use, and independent of any test runner framework too. Changing all my tests when switching from `jest` to `vitest` or `ava` is _not_ something I'm a fan of.

It leverages the zod library to allow you to check how your spied mocks are being called, with lots of flexibility.

This is a work in progress and is subject to change completely and breakingly. Feel free to contribute though.

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

## TODO: All possible arguments

TODO here: add a list of all the types of arguments that can be passed to the spy withArgs

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
