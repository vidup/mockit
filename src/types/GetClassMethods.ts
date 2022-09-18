export type BuildMethodsMap<Class, V> = {
  [K in keyof Class as Class[K] extends V ? K : never]: Class[K];
};

export type GetClassMethods<Class> = keyof BuildMethodsMap<Class, Function>;
