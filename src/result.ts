import { Ok } from "./ok";
import { Err } from "./err";
import { Mapper, expect_never } from "./utils";
import { ResultVariant, Option, Some, None } from ".";

export type ResultType<T, E> = Ok<T> | Err<E>;

export class Result<T, E> {
  constructor(readonly result: ResultType<T, E>) {}

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

  public is_ok(): this is { result: Ok<T> } {
    return this.match({
      ok: (_: T) => true,
      err: (_: E) => false,
    });
  }

  public is_err(): this is { result: Err<E> } {
    return !this.is_ok();
  }

  public ok(): Option<T> {
    return this.match({
      ok: (x: T) => Some(x),
      err: (_: E) => None(),
    });
  }

  public err(): Option<E> {
    return this.match({
      ok: (_: T) => None(),
      err: (e: E) => Some(e),
    });
  }

  public map<U>(op: Mapper<T, U>): Result<U, E> {
    return this.match({
      ok: (t: T) => Result.Ok(op(t)),
      err: (e: E) => Result.Err(e),
    });
  }

  public map_err<F>(op: Mapper<E, F>): Result<T, F> {
    return this.match({
      ok: (t: T) => Result.Ok(t),
      err: (e: E) => Result.Err(op(e)),
    });
  }

  public and<U>(res: Result<U, E>): Result<U, E> {
    return this.match({
      ok: (_: T) => res,
      err: (e: E) => Result.Err(e),
    });
  }

  public and_then<U>(op: (t: T) => Result<U, E>): Result<U, E> {
    return this.match({
      ok: (t: T) => op(t),
      err: (e: E) => Result.Err(e),
    });
  }

  public async and_then_await<U>(
    op: (t: T) => Promise<Result<U, E>>
  ): Promise<Result<U, E>> {
    return this.match({
      ok: (t: T) => op(t),
      err: async (e: E) => Result.Err(e),
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
      ok: (t: T) => Result.Ok(t),
      err: (_: E) => res,
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
      ok: (t: T) => Result.Ok(t),
      err: (e: E) => op(e),
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
      ok: (t: T) => t,
      err: (_: E) => optb,
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
      ok: (t: T) => t,
      err: (e: E) => op(e),
    });
  }

  public unwrap(): T {
    return this.match({
      ok: (t: T) => t,
      err: (_: E) => {
        throw new Error("called `Result.unwrap()` on an `Err` value");
      },
    });
  }

  public unwrap_err(): E {
    return this.match({
      ok: (_: T) => {
        throw new Error("called `Result.unwrap_err()` on an `Ok` value");
      },
      err: (e: E) => e,
    });
  }

  public expect(msg: string): T {
    return this.match({
      ok: (t: T) => t,
      err: (_: E) => {
        throw new Error(msg);
      },
    });
  }

  public expect_err(msg: string): E {
    return this.match({
      ok: (_: T) => {
        throw new Error(msg);
      },
      err: (e: E) => e,
    });
  }

  public static Ok<T>(val: T): Result<T, any> {
    return new Result(Ok(val));
  }

  public static Err<E>(err: E): Result<any, E> {
    return new Result(Err(err));
  }

  public static from<T, E>(op: () => T): Result<T, E> {
    try {
      return Result.Ok(op());
    } catch (e) {
      return Result.Err(e);
    }
  }

  public static of<T, E>(op: () => T): Result<T, E> {
    return Result.from(op);
  }

  public static async await<T, E>(p: Promise<T>): Promise<Result<T, E>> {
    try {
      return Result.Ok(await p);
    } catch (e) {
      return Result.Err(e);
    }
  }

  public static await_fn<T, E>(op: () => Promise<T>): Promise<Result<T, E>> {
    return Result.await<T, E>(op());
  }

  public static async await_all<T, E>(
    ps: Array<Promise<T>>
  ): Promise<Result<T[], E>> {
    try {
      return Result.Ok(await Promise.all(ps));
    } catch (e) {
      return Result.Err(e);
    }
  }

  public static await_all_fn<T, E>(
    op: () => Array<Promise<T>>
  ): Promise<Result<T[], E>> {
    return Result.await_all(op());
  }
}
