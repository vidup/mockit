export type AbstractClass<T> = abstract new (...args: any[]) => T;
export type Class<T> = new (...args: any[]) => T;
