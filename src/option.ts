import { Result } from "./index";
import { None } from "./none";
import { Some } from "./some";
import {
  always_false,
  always_null,
  always_true,
  expect_never,
  identity,
  is_void,
  Mapper,
  noop,
} from "./utils";
import { OptionVariant } from "./variant";

export type Nullable<T> = T | undefined | void | null;
export type OptionType<T> = Some<T> | None;

export interface OptionMatcher<T, Output> {
  Some(value: T): Output;
  None(): Output;
}

export type UnwrapSome<O> = O extends Option<infer T> ? T : never;

/**
 * Option is a wrapper type for nullable values (`undefined|null`). `Option.of`
 * will consume a nullable value `T` into an `Option<T>` for conducting safe
 * operations using all the class' combinators.
 */
export class Option<T> {
  /**
   * Warning!
   * --------
   *
   * You should never construct an Option object manually. Use the `Some` and
   * `None` helpers to create an Option object from a value or nothing.
   */
  constructor(readonly option: OptionType<T>) {}

  public match<Output>(matcher: OptionMatcher<T, Output>): Output {
    switch (this.option.variant) {
      default:
        return expect_never(this.option, "invalid Option variant");
      case OptionVariant.None:
        return matcher.None();
      case OptionVariant.Some:
        return matcher.Some(this.option.value);
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
      Some: always_true,
      None: always_false,
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

  /**
   * Returns the wrapped Some value or throws an Error
   * with the given message.
   */
  public expect(msg: string): T {
    return this.match<T>({
      Some: identity,
      None() {
        throw new Error(msg);
      },
    });
  }

  /**
   * Returns the wrapped Some value or throws an Error.
   */
  public unwrap(): T {
    return this.match<T>({
      Some: identity,
      None: () => {
        throw new Error(`Called 'Option.unwrap()' on ${this.toString()}`);
      },
    });
  }

  /**
   * Returns the wrapped Some value or the given default.
   */
  public unwrap_or(def: T): T {
    return this.match({
      Some: identity,
      None: () => def,
    });
  }

  /**
   * Returns the wrapped Some value
   * or calls and returns the result of the given func.
   */
  public unwrap_or_else(fn: () => T): T {
    return this.match({
      Some: identity,
      None: fn,
    });
  }

  /**
   * Returns `None` if the option is `None`, otherwise calls `predicate`
   * with the wrapped value and returns:
   * - `Some(t)` if `predicate` returns `true` (where `t` is the wrapped
   * value), and
   * - `None` if `predicate` returns `false`.
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
    return this.match<Option<T>>({
      None: Option.None,
      Some: (value) => {
        if (!predicate(value)) {
          return Option.None();
        }

        return Option.Some(value);
      },
    });
  }

  /**
   * `narrow` accepts a TypeScript type guard to narrow the generic type
   * held within `Option<T>`.
   */
  public narrow<U extends T>(predicate: (t: T) => t is U): Option<U> {
    return this.match<Option<U>>({
      None: Option.None,
      Some: (value) => {
        if (!predicate(value)) {
          return Option.None();
        }

        return Option.Some(value);
      },
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
      Some: Result.Ok,
      None: () => Result.Err(err),
    });
  }

  /**
   * Transforms the `Option<T>` into a [`Result<T, E>`], mapping [`Some(v)`] to
   * [`Ok(v)`] and [`None`] to [`Err(err())`].
   *
   * ```
   * let x = Some("foo");
   * expect(x.ok_or_else(() => Err(0))).toEqual(Ok("foo"));
   *
   * let x: Option<string> = None;
   * expect(x.ok_or_else(() => Err(0)).toEqual(Err(0));
   * ```
   */
  public ok_or_else<E>(err: () => E): Result<T, E> {
    return this.match({
      Some: Result.Ok,
      None: () => Result.Err(err()),
    });
  }

  /**
   * `tap` allows you to do side-effects with the value
   * when `Option` is `Some<T>`.
   */
  public tap(fn: (x: T) => any): this {
    this.match({ None: noop, Some: fn });

    return this;
  }

  /**
   * Safely transform the wrapped Some value from `T` => `U`.
   *
   * ```
   * // Transform Option<string> => Option<number>
   * Option.of(maybeStr).map(str => str.trim().length)
   * ```
   */
  public map<U>(fn: Mapper<T, U>): Option<U> {
    return this.match({
      Some: (x: T) => Option.Some(fn(x)),
      None: Option.None,
    });
  }

  /**
   * `map_to` transforms the inner value when Some.
   */
  public map_to<U>(value: U): Option<U> {
    return this.map(() => value);
  }

  /**
   * Safely transform the wrapped Some value from `T` => `U`
   * and return the transformed value or a default if wrapped value is None.
   */
  public map_or<U>(def: U, fn: Mapper<T, U>): U {
    return this.match({
      Some: fn,
      None: () => def,
    });
  }

  /**
   * Safely transform the wrapped Some value from `T` => `U`
   * and return the transformed value
   * or call a func to return a default if wrapped value is None.
   */
  public map_or_else<U>(def: () => U, fn: Mapper<T, U>): U {
    return this.match({
      Some: fn,
      None: def,
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
      Some: () => optb,
      None: Option.None,
    });
  }

  /**
   * Maps an `Option<T>` to a promise of `Option<U>`, but only maps `Some` if
   * the state of the current Option is `Some`.
   */
  public and_await<U>(optb: Promise<Option<U>>): Promise<Option<U>> {
    return this.match({
      Some: () => optb,
      None: () => Promise.resolve(Option.None()),
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
      Some: fn,
      None: Option.None,
    });
  }

  /**
   * Maps an `Option<T>` to a promise of `Option<U>`, but only invokes the
   * function `Some` if the state of the current Option is `Some`.
   */
  public and_then_await<U>(
    fn: (t: T) => Promise<Option<U>>
  ): Promise<Option<U>> {
    return this.match({
      Some: fn,
      None: () => Promise.resolve(Option.None()),
    });
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
      Some: Option.Some,
      None: () => optb,
    });
  }

  /**
   * Unwraps the optional value, returning `null` when `None`.
   */
  public or_null(): null | T {
    return this.match({
      None: () => null,
      Some: identity,
    });
  }

  /**
   * Unwraps the optional value, returning `undefined` when `None`.
   */
  public or_void(): undefined | T {
    return this.match({
      None: () => undefined,
      Some: identity,
    });
  }

  /**
   * `or_await` returns the Option wrapped in a Promise if it contains a value,
   * or else returns the given promised Option.
   */
  public or_await(optb: Promise<Option<T>>): Promise<Option<T>> {
    return this.match({
      Some: (value) => Promise.resolve(Option.Some(value)),
      None: () => optb,
    });
  }

  /**
   * Returns the option if it contains a value, otherwise calls `fn` and
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
      Some: Option.Some,
      None: fn,
    });
  }

  /**
   * `or_else_await` returns the Option wrapped in a Promise if it contains a value,
   * or else calls the given function and returns its promised Option.
   */
  public or_else_await(fn: () => Promise<Option<T>>): Promise<Option<T>> {
    return this.match({
      Some: (value) => Promise.resolve(Option.Some(value)),
      None: fn,
    });
  }

  /**
   * Maps the option type to a Result type.
   * A Some value is considered an Ok,
   * while a None value is considered an Err.
   *
   * ```
   * Some(T) => Ok(T)
   * None() => Err(undefined)
   * ```
   */
  public into_result(): Result<T, void> {
    return this.match({
      Some: Result.Ok,
      None: () => Result.Err(undefined),
    });
  }

  /**
   * Maps the option type to the opposite Result of `Option.into_result`.
   * A None value is considered an Ok,
   * while a Some value is considered an Err.
   *
   * This is used most commonly with a NodeJS style callback
   * containing `Error | null` as the first argument.
   *
   * ```
   * Some(T) => Err(T)
   * None() => Ok(void)
   *
   * // Promisify fs.readFile, but only resolve
   * // using the Result type.
   * // Start by consuming the err
   * // in the option to determine it's existence,
   * // then map it to an inverse Result
   * // (where Some(err) is an Err(err)),
   * // and finally map the Ok from
   * // Ok(void) => Ok(data: string)
   * let read_result = await new Promise(resolve =>
   *  fs.readFile("file.txt", "utf8", (err, data) => {
   *    resolve(Option.of(err).into_result_err().map(_ => data))
   *  })
   * )
   * // => Result<string, ErrnoException>
   * ```
   */
  public into_result_err(): Result<void, T> {
    return this.into_result().invert();
  }

  public toString(): string {
    return this.match({
      Some: (x) => `Some<${JSON.stringify(x)}>`,
      None: () => `None`,
    });
  }

  public toJSON(): T | null {
    return this.match({
      Some: identity,
      None: always_null,
    });
  }

  /**
   * Helper to compare 2 optional types.
   *
   * The compare function defaults to
   * `(a, b) => a === b`.
   *
   * ```rust
   * match (this, option) => {
   *   (None, None) => true,
   *   (Some(a), Some(b)) => compare(a, b),
   *   _ => false
   * }
   * ```
   *
   * **Abstract Truth Table**
   *
   * - `None && None = true`
   * - `Some<T> && None = false`
   * - `None && Some<U> = false`
   * - `Some<T> && Some<U> = compare(T, U)`
   */
  public is_eq<U extends T>(
    option: Option<U>,
    compare?: (a: T, b: U) => boolean
  ) {
    if (this.is_none() && option.is_none()) {
      return true;
    }

    if (this.is_some() && option.is_some()) {
      let a = this.unwrap();
      let b = option.unwrap();
      if (compare) {
        return compare(a, b);
      }

      return a === b;
    }

    return false;
  }

  /**
   * Given a nullable value of T (`T | undefined | null`),
   * returns an Option<T>
   */
  public static from<T>(val: Nullable<T>): Option<T> {
    if (is_void(val)) {
      return Option.None();
    }

    return Option.Some(val);
  }

  /**
   * Given a nullable value of T (`T | undefined | null`),
   * returns an Option<T>
   */
  public static of<T>(val: Nullable<T>): Option<T> {
    return Option.from(val);
  }

  /**
   * Given an array shaped `Option<T>[]`, returns an Option of all the unwrapped
   * values or None.
   * Eager return (returns upon first None case).
   */
  public static every<T>(options: Option<T>[]): Option<T[]> {
    let ok: T[] = [];
    let o: Option<T>;

    const matcher = {
      Some: (t: T) => ok.push(t),
      None: () => 0,
    };

    for (o of options) {
      if (0 == o.match(matcher)) {
        return Option.None();
      }
    }

    return Option.Some(ok);
  }

  /**
   * Given an array shaped `Option<T>[]`, returns an Option of any the unwrapped
   * values or None.
   */
  public static some<T>(options: Option<T>[]): Option<T[]> {
    if (options.length == 0) {
      return Option.Some([]);
    }

    let ok: T[] = [];
    let o: Option<T>;

    const matcher = {
      Some(t: T) {
        ok.push(t);
      },
      None() {},
    };

    for (o of options) {
      o.match(matcher);
    }

    if (ok.length > 0) {
      return Option.Some(ok);
    }

    return Option.None();
  }

  /**
   * Creates an Option<T> from a known value T.
   */
  public static Some<T>(val: T): Option<T> {
    return new Option(Some(val));
  }

  /**
   * Creates an Option<any> from nothing.
   */
  public static None<T = any>(): Option<T> {
    return new Option(None());
  }
}
