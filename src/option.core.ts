import { Some } from "./some";
import { None } from "./none";
import { OptionVariant } from "./variant";
import { is_never, Mapper } from "./utils";
import { Option } from "./option.class";
import { Result } from "./result.class";

export type Nullable<T> = T | undefined | null;

export type OptionType<T> = Some<T> | None;

export type OptionMatcher<T, U> = {
  [OptionVariant.None](): U;
  [OptionVariant.Some](val: T): U;
};

export interface OptionInterface<T> {
  /**
   * Returns true if the option is a None value.
   */
  is_none(): this is None;
  /**
   * Returns true if the option is a Some value.
   */
  is_some(): this is Some<T>;
  /**
   * Unwraps an option, yielding the content of a Some.
   */
  expect(err_msg: string): T;
  /**
   * Moves the value v out of the Option<T> if it is Some(v).
   * In general, because this function may panic, its use is discouraged.
   * Instead, prefer to use pattern matching and handle the None case explicitly.
   */
  unwrap(): T;
  /**
   * Returns the contained value or a default.
   */
  unwrap_or(def: T): T;
  /**
   * Returns the contained value or computes it from a closure.
   */
  unwrap_or_else(fn: () => T): T;
  /**
   * Maps an Option<T> to Option<U> by applying a function to a contained value.
   */
  map<U>(fn: Mapper<T, U>): Option<U>;
  /**
   * Applies a function to the contained value (if any),
   * or computes a default (if not).
   */
  map_or<U>(def: U, fn: Mapper<T, U>): U;
  /**
   * Applies a function to the contained value (if any),
   * or returns a default (if not).
   */
  map_or_else<U>(def: () => U, fn: Mapper<T, U>): U;
  /**
   * Transforms the Option<T> into a Result<T, E>,
   * mapping Some(v) to Ok(v) and None to Err(err).
   */
  // ok_or<E>(err: E): Result<T, E>;
  /**
   * Transforms the Option<T> into a Result<T, E>,
   * mapping Some(v) to Ok(v) and None to Err(err()).
   */
  // ok_or_else<E>(err: () => E): Result<T, E>;
  match<U>(matcher: OptionMatcher<T, U>): U;
}

export function is_none<T>(option: OptionType<T>): option is None {
  return option.variant == OptionVariant.None;
}

export function is_some<T>(option: OptionType<T>): option is Some<T> {
  return option.variant == OptionVariant.Some;
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
  fn: Mapper<T, U>
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
    case OptionVariant.None:
      return matcher[OptionVariant.None]();

    case OptionVariant.Some:
      return matcher[OptionVariant.Some](option.value);

    default:
      return is_never(option);
  }
}
