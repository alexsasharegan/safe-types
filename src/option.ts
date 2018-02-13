import { None } from "./none";
import { Some } from "./some";
import { is_void, Mapper } from "./utils";
import { OptionVariant, expect_never, Ok, Err, Result } from ".";

export type Nullable<T> = T | undefined | null;
export type OptionType<T> = Some<T> | None;

export class Option<T> {
  constructor(readonly option: OptionType<T>) {}

  public match<U>(matcher: {
    [OptionVariant.None](): U;
    [OptionVariant.Some](val: T): U;
  }): U {
    switch (this.option.variant) {
      case OptionVariant.None:
        return matcher[OptionVariant.None]();

      case OptionVariant.Some:
        return matcher[OptionVariant.Some](this.option.value);

      default:
        return expect_never(this.option, "invalid Option variant");
    }
  }

  /**
   * Returns `true` if the option is a [`Some`] value.
   *
   * ```
   * let x: Option<number> = Some(2);
   * expect(x.is_some()).toBe(true);
   *
   * let x: Option<number> = None();
   * expect(x.is_some()).toBe(false);
   * ```
   */
  public is_some(): this is { option: Some<T> } {
    return this.match({
      some: (_: T) => true,
      none: () => false,
    });
  }

  /**
   * Returns `true` if the option is a [`None`] value.
   *
   * ```
   * let x: Option<number> = Some(2);
   * expect(x.is_some()).toBe(false);
   *
   * let x: Option<number> = None();
   * expect(x.is_some()).toBe(true);
   * ```
   */
  public is_none(): this is { option: None } {
    return !this.is_some();
  }

  public expect(msg: string): T {
    return this.match({
      some: (x: T) => x,
      none: () => {
        throw new Error(msg);
      },
    });
  }

  public unwrap(): T {
    return this.match({
      some: (x: T) => x,
      none: () => {
        throw new Error("called `Option.unwrap()` on a `None` value");
      },
    });
  }

  public unwrap_or(def: T): T {
    return this.match({
      some: (x: T) => x,
      none: () => def,
    });
  }

  public unwrap_or_else(fn: () => T): T {
    return this.match({
      some: (x: T) => x,
      none: () => fn(),
    });
  }

  public map<U>(fn: Mapper<T, U>): Option<U> {
    return this.match({
      some: (x: T) => Option.Some(fn(x)),
      none: () => Option.None(),
    });
  }

  public map_or<U>(def: U, fn: Mapper<T, U>): U {
    return this.match({
      some: (x: T) => fn(x),
      none: () => def,
    });
  }

  public map_or_else<U>(def: () => U, fn: Mapper<T, U>): U {
    return this.match({
      some: (x: T) => fn(x),
      none: () => def(),
    });
  }

  /**
   * Transforms the `Option<T>` into a [`Result<T, E>`], mapping [`Some(v)`] to
   * [`Ok(v)`] and [`None`] to [`Err(err)`].
   *
   * Arguments passed to `ok_or` are eagerly evaluated; if you are passing the
   * result of a function call, it is recommended to use [`ok_or_else`], which is
   * lazily evaluated.
   *
   * ```
   * let x = Some("foo");
   * expect(x.ok_or(0)).toEqual(Ok("foo"));
   *
   * let x: Option<string> = None();
   * expect(x.ok_or(0)).toEqual(Err(0));
   * ```
   */
  public ok_or<E>(err: E): Result<T, E> {
    return this.match({
      some: (t: T) => Ok(t),
      none: () => Err(err),
    });
  }

  public ok_or_else<E>(err: () => E): Result<T, E> {
    return this.match({
      some: (t: T) => Ok(t),
      none: () => Err(err()),
    });
  }

  /**
   * Returns [`None`] if the option is [`None`], otherwise returns `optb`.
   *
   * ```
   * let x = Some(2);
   * let y: Option<string> = None();
   * expect(x.and(y)).toEqual(None());
   *
   * let x: Option<number> = None();
   * let y = Some("foo");
   * expect(x.and(y)).toEqual(None());
   *
   * let x = Some(2);
   * let y = Some("foo");
   * expect(x.and(y)).toEqual(Some("foo"));
   *
   * let x: Option<number> = None();
   * let y: Option<string> = None();
   * expect(x.and(y)).toEqual(None());
   * ```
   */
  public and<U>(optb: Option<U>): Option<U> {
    return this.match({
      some: (_: T) => optb,
      none: () => Option.None(),
    });
  }

  /**
   * Returns [`None`] if the option is [`None`], otherwise calls `f` with the
   * wrapped value and returns the result.
   *
   * Some languages call this operation flatmap.
   *
   * ```
   * let sq = (x: number) => Some(x * x)
   * let nope = (_: number) => None()
   *
   * expect(Some(2).and_then(sq).and_then(sq)).toEqual(Some(16));
   * expect(Some(2).and_then(sq).and_then(nope)).toEqual(None());
   * expect(Some(2).and_then(nope).and_then(sq)).toEqual(None());
   * expect(None().and_then(sq).and_then(sq)).toEqual(None());
   * ```
   */
  public and_then<U>(fn: (t: T) => Option<U>): Option<U> {
    return this.match({
      some: (t: T) => fn(t),
      none: () => Option.None(),
    });
  }

  /**
   * Returns `None` if the option is `None`, otherwise calls `predicate`
   * with the wrapped value and returns:
   * - `Some(t)` if `predicate` returns `true` (where `t` is the wrapped
   * value), and
   * - `None` if `predicate` returns `false`.
   *
   * This function works similar to `Iterator::filter()`. You can imagine
   * the `Option<T>` being an iterator over one or zero elements. `filter()`
   * lets you decide which elements to keep.
   *
   * ```
   * let is_even = (n: number) => n % 2 == 0
   *
   * expect(None().filter(is_even)).toEqual(None());
   * expect(Some(3).filter(is_even)).toEqual(None());
   * expect(Some(4).filter(is_even)).toEqual(Some(4));
   * ```
   */
  public filter(predicate: (t: T) => boolean): Option<T> {
    if (this.is_some() && predicate(this.option.value)) {
      return Option.Some(this.option.value);
    }

    return Option.None();
  }

  /**
   * Returns the option if it contains a value, otherwise returns `optb`.
   *
   * Arguments passed to `or` are eagerly evaluated; if you are passing the
   * result of a function call, it is recommended to use [`or_else`], which is
   * lazily evaluated.
   *
   * ```
   * let x = Some(2);
   * let y = None();
   * expect(x.or(y)).toEqual(Some(2));
   *
   * let x = None();
   * let y = Some(100);
   * expect(x.or(y)).toEqual(Some(100));
   *
   * let x = Some(2);
   * let y = Some(100);
   * expect(x.or(y)).toEqual(Some(2));
   *
   * let x: Option<number> = None();
   * let y = None();
   * expect(x.or(y)).toEqual(None());
   * ```
   */
  public or(optb: Option<T>): Option<T> {
    return this.match({
      some: (t: T) => Option.Some(t),
      none: () => optb,
    });
  }

  /**
   * Returns the option if it contains a value, otherwise calls `f` and
   * returns the result.
   *
   * ```
   * let nobody = () => None()
   * let vikings = () => Some("vikings")
   *
   * expect(Some("barbarians").or_else(vikings)).toEqual(Some("barbarians"));
   * expect(None().or_else(vikings)).toEqual(Some("vikings"));
   * expect(None().or_else(nobody)).toEqual(None());
   * ```
   */
  public or_else(fn: () => Option<T>): Option<T> {
    return this.match({
      some: (t: T) => Option.Some(t),
      none: () => fn(),
    });
  }

  public static from<U>(val: Nullable<U>): Option<U> {
    if (is_void(val)) {
      return Option.None();
    }

    return Option.Some(val);
  }

  public static of<U>(val: Nullable<U>): Option<U> {
    return Option.from(val);
  }

  public static Some<T>(val: T): Option<T> {
    return new Option(Some(val));
  }

  public static None(): Option<any> {
    return new Option(None());
  }
}
