export type GetClassMethods<Class, V> = {
  [K in keyof Class as Class[K] extends V ? K : never]: Class[K];
};
