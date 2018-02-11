import { None, Some, Variant, is_void } from ".";

export type Option<T> = Some<T> | None;

export interface OptionMethods<T> {
  is_none(): this is None;
  is_some(): this is Some<T>;
  expect(err_msg: string): T;
  unwrap(): T;
  unwrap_or(def: T): T;
  unwrap_or_else(fn: () => T): T;
  map<U>(fn: (val: T) => U): Option<U>;
  map_or<U>(def: U, fn: (val: T) => U): U;
  map_or_else<U>(def: () => U, fn: (val: T) => U): U;
}

export type OptionChainable<T> = Option<T> & OptionMethods<T>;

export function is_none<T>(option: Option<T>): option is None {
  return option.variant == Variant.None;
}

export function is_some<T>(option: Option<T>): option is Some<T> {
  return option.variant == Variant.Some;
}

export function expect<T>(option: Option<T>, err_msg: string): T {
  if (is_none(option)) {
    throw Error(err_msg);
  }

  return option.value;
}

export function unwrap<T>(option: Option<T>): T {
  if (is_none(option)) {
    throw TypeError("Cannot unwrap option of None.");
  }

  return option.value;
}

export function unwrap_or<T>(option: Option<T>, def: T): T {
  if (is_none(option)) {
    return def;
  }

  return option.value;
}

export function unwrap_or_else<T>(option: Option<T>, fn: () => T): T {
  if (is_none(option)) {
    return fn();
  }

  return option.value;
}

export function map<T, U>(option: Option<T>, fn: (val: T) => U): Option<U> {
  if (is_none(option)) {
    return None();
  }

  return Some(fn(option.value));
}

export function map_or<T, U>(option: Option<T>, def: U, fn: (val: T) => U): U {
  if (is_none(option)) {
    return def;
  }

  return fn(option.value);
}

export function map_or_else<T, U>(
  option: Option<T>,
  def: () => U,
  fn: (val: T) => U
): U {
  if (is_none(option)) {
    return def();
  }

  return fn(option.value);
}

export function from<T>(val?: T): OptionChainable<T> {
  let o: Option<T> = is_void(val) ? None() : Some(val);

  let m: OptionMethods<T> = {
    is_none: () => is_none(o),
    is_some: () => is_some(o),
    expect: (err_msg: string) => expect(o, err_msg),
    unwrap: () => unwrap(o),
    unwrap_or: (def: T) => unwrap_or(o, def),
    unwrap_or_else: (fn: () => T) => unwrap_or_else(o, fn),
    map: <U>(fn: (val: T) => U): Option<U> => map(o, fn),
    map_or: <U>(def: U, fn: (val: T) => U): U => map_or(o, def, fn),
    map_or_else: <U>(def: () => U, fn: (val: T) => U): U =>
      map_or_else(o, def, fn),
  };

  return Object.assign({}, o, m);
}
