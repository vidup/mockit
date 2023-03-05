import { HashingMap } from "../HashingMap";
import { Behaviour, NewBehaviourParam } from "../types/behaviour";
import { FunctionCalls } from "../functionSpy";

import { applyCatch } from "./applyCatch";
import { getCatch } from "./getCatch";
import { setCatch } from "./setCatch";

import { FunctionMockUtils } from "./utils";

export const Behaviours = {
  Return: "Return",
  Throw: "Throw",
  Call: "Call",
  Resolve: "Resolve",
  Reject: "Reject",
} as const;

export type BehaviourType = typeof Behaviours[keyof typeof Behaviours];

/**
 * This is the function mock "class", it is taking the place of the function
 * that we want to mock.
 * It is a proxy, so it makes itself look like a function but in reality is
 * a complex object that can catch calls, store and return data.
 *
 * It's a central piece of the library, because it is used in all mocks (function, class, abstract)
 */
export function FunctionMock(functionName: string) {
  const proxy = new Proxy(() => {}, {
    /**
     * This will be triggered when the function mock is called.
     */
    apply: applyCatch,

    /**
     * This is internal, and allow us to get information stored in the mock
     */
    get: getCatch,

    /**
     * This is internal, and allow us to set information in the mock,
     * like the default behaviour, or a custom behaviour,
     * or calls data for the spying feature.
     */
    set: setCatch,
  });

  new FunctionMockUtils(proxy).initialize(functionName);
  return proxy;
}

const defaultBehaviour: NewBehaviourParam = {
  behaviour: Behaviour.Return,
  returnedValue: undefined,
};

export function initializeProxy(proxy: any, functionName: string) {
  Reflect.set(proxy, "init", {
    defaultBehaviour,
    functionName,
    calls: [],
    mockMap: new HashingMap(),
    callsMap: new FunctionCalls(),
  });
}

export function changeDefaultBehaviour(
  proxy: any,
  newBehaviour: NewBehaviourParam
) {
  Reflect.set(proxy, "defaultBehaviour", newBehaviour);
}
