import { Some } from "./some";
import { None } from "./none";
import { Variant } from "./variant";
import { is_never } from "./utils";
import { Option } from "./option.class";

export type Nullable<T> = T | undefined | null;

export type OptionType<T> = Some<T> | None;

export type OptionMatcher<T, U> = {
  none(): U;
  some(val: T): U;
};

export interface OptionInterface<T> {
  is_none(): this is None;
  is_some(): this is Some<T>;
  expect(err_msg: string): T;
  unwrap(): T;
  unwrap_or(def: T): T;
  unwrap_or_else(fn: () => T): T;
  map<U>(fn: (val: T) => U): Option<U>;
  map_or<U>(def: U, fn: (val: T) => U): U;
  map_or_else<U>(def: () => U, fn: (val: T) => U): U;

  match<U>(matcher: OptionMatcher<T, U>): U;
}

export function is_none<T>(option: OptionType<T>): option is None {
  return option.variant == Variant.None;
}

export function is_some<T>(option: OptionType<T>): option is Some<T> {
  return option.variant == Variant.Some;
}

export function expect<T>(option: OptionType<T>, err_msg: string): T {
  if (is_none(option)) {
    throw Error(err_msg);
  }

  return option.value;
}

export function unwrap<T>(option: OptionType<T>): T {
  if (is_none(option)) {
    throw TypeError("Cannot unwrap option of None.");
  }

  return option.value;
}

export function unwrap_or<T>(option: OptionType<T>, def: T): T {
  if (is_none(option)) {
    return def;
  }

  return option.value;
}

export function unwrap_or_else<T>(option: OptionType<T>, fn: () => T): T {
  if (is_none(option)) {
    return fn();
  }

  return option.value;
}

export function map<T, U>(
  option: OptionType<T>,
  fn: (val: T) => U
): OptionType<U> {
  if (is_none(option)) {
    return None();
  }

  return Some(fn(option.value));
}

export function map_or<T, U>(
  option: OptionType<T>,
  def: U,
  fn: (val: T) => U
): U {
  if (is_none(option)) {
    return def;
  }

  return fn(option.value);
}

export function map_or_else<T, U>(
  option: OptionType<T>,
  def: () => U,
  fn: (val: T) => U
): U {
  if (is_none(option)) {
    return def();
  }

  return fn(option.value);
}

export function match<T, U>(
  option: OptionType<T>,
  matcher: OptionMatcher<T, U>
): U {
  switch (option.variant) {
    case Variant.None:
      return matcher[Variant.None]();

    case Variant.Some:
      return matcher[Variant.Some](option.value);

    default:
      return is_never(option);
  }
}
