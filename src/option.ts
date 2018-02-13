import { None } from "./none";
import { Some } from "./some";
import { is_void, Mapper } from "./utils";
import { OptionVariant, expect_never, Ok, Err, Result } from ".";

export type Nullable<T> = T | undefined | null;
export type OptionType<T> = Some<T> | None;

export class Option<T> {
  constructor(private readonly option: OptionType<T>) {}

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
  public is_some(): this is Some<T> {
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
  public is_none(): this is None {
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

  public static None<T>(): Option<T> {
    return new Option(None());
  }
}
