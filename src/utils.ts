export function is_void(val: any): val is null | undefined {
  return val == null;
}

export function is_never(x: never): never {
  throw new Error();
}
