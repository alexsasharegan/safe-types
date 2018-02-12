export type Mapper<T, U> = (x: T) => U;

export function is_void(val: any): val is null | undefined {
  return val == null;
}

export function is_never(_: never): never {
  throw new Error();
}
