import { Ok } from "./ok";
import { Err } from "./err";
import { Mapper, expect_never } from "./utils";
import { Option, Some, None, ResultVariant } from ".";

export type ResultType<T, E> = Ok<T> | Err<E>;

/**
 * Result is a wrapper type for operations that can succeed or fail.
 * Not all operations throw errors in failure cases. Any value can be an Err.
 * Result simultaneously holds either an `Ok` that holds any type
 * and and `Err` that also can hold any type.
 */
export class Result<T, E> {
  constructor(readonly result: ResultType<T, E>) {}

  /**
   * Perform a pseudo pattern match on the underlying Ok or Err type.
   * Matches the type and then returns the value of calling the matcher's
   * function with the value.
   */
  public match<U>(matcher: {
    [ResultVariant.Ok](x: T): U;
    [ResultVariant.Err](e: E): U;
  }): U {
    switch (this.result.variant) {
      case ResultVariant.Ok:
        return matcher[ResultVariant.Ok](this.result.value);

      case ResultVariant.Err:
        return matcher[ResultVariant.Err](this.result.error);

      default:
        return expect_never(this.result, "invalid `Result` variant");
    }
  }

  /**
   * Returns true if the underlying type is an Ok.
   *
   * ```
   * let result = Ok(2)
   * result.is_ok()
   * // => true
   * ```
   */
  public is_ok(): this is { result: Ok<T> } {
    return this.match({
      Ok: (_: T) => true,
      Err: (_: E) => false,
    });
  }

  /**
   * Returns true if the underlying type is an Err.
   *
   * ```
   * let result = Ok(2)
   * result.is_err()
   * // => false
   * ```
   */
  public is_err(): this is { result: Err<E> } {
    return !this.is_ok();
  }

  /**
   * Returns an Option of the Ok type.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.ok()
   * // => Option<string>
   * ```
   */
  public ok(): Option<T> {
    return this.match({
      Ok: (x: T) => Some(x),
      Err: (_: E) => None(),
    });
  }

  /**
   * Returns an Option of the Err type.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.err()
   * // => Option<Error>
   * ```
   */
  public err(): Option<E> {
    return this.match({
      Ok: (_: T) => None(),
      Err: (e: E) => Some(e),
    });
  }

  /**
   * Perform a transformation on the possible Ok type.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.map(str => str.length)
   * // => Result<number, Error>
   * ```
   */
  public map<U>(op: Mapper<T, U>): Result<U, E> {
    return this.match({
      Ok: (t: T) => Result.Ok(op(t)),
      Err: (e: E) => Result.Err(e),
    });
  }

  /**
   * Perform a transformation on the possible Err type.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.map_err(err => err.message)
   * // => Result<string, string>
   * ```
   */
  public map_err<F>(op: Mapper<E, F>): Result<T, F> {
    return this.match({
      Ok: (t: T) => Result.Ok(t),
      Err: (e: E) => Result.Err(op(e)),
    });
  }

  /**
   * Perform transformations on both of the possible types.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.map_both(console.log, console.error)
   * // => Result<void, void>
   * // => prints to stdout/stderr
   * ```
   */
  public map_both<U, F>(
    ok_op: Mapper<T, U>,
    err_op: Mapper<E, F>
  ): Result<U, F> {
    return this.match({
      Ok: (t: T) => Result.Ok(ok_op(t)),
      Err: (e: E) => Result.Err(err_op(e)),
    });
  }

  /**
   * Swaps the result's Ok type with the given result if Ok.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.and(readFileSync("bar.txt"))
   * // => Result<string, Error>
   * ```
   */
  public and<U>(res: Result<U, E>): Result<U, E> {
    return this.match({
      Ok: (_: T) => res,
      Err: (e: E) => Result.Err(e),
    });
  }

  /**
   * Swaps the result's Ok type with the given Promised result if Ok
   * and normalizes the possible Err type to a Promised Err.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.and_await(readFile("bar.txt"))
   * // => Promise<Result<string, Error>>
   * ```
   */
  public and_await<U>(res: Promise<Result<U, E>>): Promise<Result<U, E>> {
    return this.match({
      Ok: (_: T) => res,
      Err: (e: E) => Promise.resolve(Result.Err(e)),
    });
  }

  /**
   * Calls the given operation and swaps the Ok type if Ok.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.and_then(contents => readFileSync(contents.match(/\.txt$/)[1]))
   * // => Result<string, Error>
   * ```
   */
  public and_then<U>(op: (t: T) => Result<U, E>): Result<U, E> {
    return this.match({
      Ok: (t: T) => op(t),
      Err: (e: E) => Result.Err(e),
    });
  }

  /**
   * Calls the given operation and swaps the Ok type with the promised Ok.
   * Err type is converted to a Promised Err.
   *
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.and_then(contents => readFile(contents.match(/\.txt$/)[1]))
   * // => Promise<Result<string, Error>>
   * ```
   */
  public and_then_await<U>(
    op: (t: T) => Promise<Result<U, E>>
  ): Promise<Result<U, E>> {
    return this.match({
      Ok: (t: T) => op(t),
      Err: (e: E) => Promise.resolve(Result.Err(e)),
    });
  }

  /**
   * Returns `res` if the result is [`Err`],
   * otherwise returns the [`Ok`] value of `self`.
   *
   * Arguments passed to `or` are eagerly evaluated; if you are passing the
   * result of a function call, it is recommended to use [`or_else`], which is
   * lazily evaluated.
   *
   * ```
   * let x = Ok(2);
   * let y = Err("late error");
   * expect(x.or(y)).toEqual(Ok(2));
   *
   * let x = Err("early error");
   * let y = Ok(2);
   * expect(x.or(y)).toEqual(Ok(2));
   *
   * let x = Err("not a 2");
   * let y = Err("late error");
   * expect(x.or(y)).toEqual(Err("late error"));
   *
   * let x = Ok(2);
   * let y = Ok(100);
   * expect(x.or(y)).toEqual(Ok(2));
   * ```
   */
  public or<F>(res: Result<T, F>): Result<T, F> {
    return this.match({
      Ok: (t: T) => Result.Ok(t),
      Err: (_: E) => res,
    });
  }

  /**
   * Calls `op` if the result is [`Err`],
   * otherwise returns the [`Ok`] value of `self`.
   *
   * This function can be used for control flow based on result values.
   *
   * ```
   * let sq = (x: number) => Ok(x * x)
   * let err = (x: number) => Err(x)
   *
   * expect(Ok(2).or_else(sq).or_else(sq)).toEqual(Ok(2));
   * expect(Ok(2).or_else(err).or_else(sq)).toEqual(Ok(2));
   * expect(Err(3).or_else(sq).or_else(err)).toEqual(Ok(9));
   * expect(Err(3).or_else(err).or_else(err)).toEqual(Err(3));
   * ```
   */
  public or_else<F>(op: (e: E) => Result<T, F>): Result<T, F> {
    return this.match({
      Ok: (t: T) => Result.Ok(t),
      Err: (e: E) => op(e),
    });
  }

  /**
   * Unwraps a result, yielding the content of an [`Ok`].
   * Else, it returns `optb`.
   *
   * Arguments passed to `unwrap_or` are eagerly evaluated; if you are passing
   * the result of a function call, it is recommended to use [`unwrap_or_else`],
   * which is lazily evaluated.
   *
   * ```
   * let optb = 2;
   * let x: Result<number, string> = Ok(9);
   * expect(x.unwrap_or(optb)).toEqual(9);
   *
   * let x: Result<number, string> = Err("error");
   * expect(x.unwrap_or(optb)).toEqual(optb);
   * ```
   */
  public unwrap_or(optb: T): T {
    return this.match({
      Ok: (t: T) => t,
      Err: (_: E) => optb,
    });
  }

  /**
   * Unwraps a result, yielding the content of an [`Ok`].
   * If the value is an [`Err`] then it calls `op` with its value.
   *
   * ```
   * let count = (x: string) => x.length;
   *
   * expect(Ok(2).unwrap_or_else(count)).toEqual(2);
   * expect(Err("foo").unwrap_or_else(count)).toEqual(3);
   * ```
   */
  public unwrap_or_else(op: (e: E) => T): T {
    return this.match({
      Ok: (t: T) => t,
      Err: (e: E) => op(e),
    });
  }

  /**
   * Returns the Ok type, or throws an Error.
   */
  public unwrap(): T {
    return this.match({
      Ok: (t: T) => t,
      Err: (_: E) => {
        throw new Error("called `Result.unwrap()` on an `Err` value");
      },
    });
  }

  /**
   * Returns the Err type, or throws an Error.
   */
  public unwrap_err(): E {
    return this.match({
      Ok: (_: T) => {
        throw new Error("called `Result.unwrap_err()` on an `Ok` value");
      },
      Err: (e: E) => e,
    });
  }

  /**
   * Returns the Ok type, or throws an Error with the given message.
   */
  public expect(msg: string): T {
    return this.match({
      Ok: (t: T) => t,
      Err: (_: E) => {
        throw new Error(msg);
      },
    });
  }

  /**
   * Returns the Err type, or throws an Error with the given message.
   */
  public expect_err(msg: string): E {
    return this.match({
      Ok: (_: T) => {
        throw new Error(msg);
      },
      Err: (e: E) => e,
    });
  }

  /**
   * Remaps the result types so the `Ok<T>` becomes `Err<T>`
   * and the `Err<E>` becomes `Ok<E>`
   */
  public invert(): Result<E, T> {
    return this.match({
      Ok: (t: T) => Result.Err(t),
      Err: (e: E) => Result.Ok(e),
    });
  }

  /**
   * Returns an Ok result of the given type.
   */
  public static Ok<T, E = any>(val: T): Result<T, E> {
    return new Result(Ok(val));
  }

  /**
   * Returns an Err result of the given type.
   */
  public static Err<E, T = any>(err: E): Result<T, E> {
    return new Result(Err(err));
  }

  /**
   * Calls the operation and returns an Ok result
   * or an Err result if an Error is thrown.
   */
  public static from<T, E>(op: () => T): Result<T, E> {
    try {
      return Result.Ok(op());
    } catch (e) {
      return Result.Err(e);
    }
  }

  /**
   * Calls the operation and returns an Ok result
   * or an Err result if an Error is thrown.
   */
  public static of<T, E>(op: () => T): Result<T, E> {
    return Result.from(op);
  }

  /**
   * Awaits the Promise and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  public static async await<T, E>(p: Promise<T>): Promise<Result<T, E>> {
    try {
      return Result.Ok(await p);
    } catch (e) {
      return Result.Err(e);
    }
  }

  /**
   * Calls the async operation and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  public static await_fn<T, E>(op: () => Promise<T>): Promise<Result<T, E>> {
    return Result.await<T, E>(op());
  }

  /**
   * Awaits an array of Promises and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  public static async await_all<T, E>(
    ps: Array<Promise<T>>
  ): Promise<Result<T[], E>> {
    try {
      return Result.Ok(await Promise.all(ps));
    } catch (e) {
      return Result.Err(e);
    }
  }

  /**
   * Calls the async operation and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  public static await_all_fn<T, E>(
    op: () => Array<Promise<T>>
  ): Promise<Result<T[], E>> {
    return Result.await_all(op());
  }
}
