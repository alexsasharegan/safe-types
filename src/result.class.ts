import { Ok } from "./ok";
import { Err } from "./err";
import { Mapper, expect_never } from "./utils";
import { ResultVariant, Option, Some, None } from ".";

export type ResultType<T, E> = Ok<T> | Err<E>;

export class Result<T, E> {
  constructor(private readonly result: ResultType<T, E>) {}

  match<U>(matcher: {
    [ResultVariant.Ok](x: T): U;
    [ResultVariant.Err](e: E): U;
  }): U {
    switch (this.result.variant) {
      case ResultVariant.Ok:
        return matcher[ResultVariant.Ok](this.result.value);

      case ResultVariant.Err:
        return matcher[ResultVariant.Err](this.result.error);

      default:
        return expect_never(this.result, "Invalid Result variant.");
    }
  }

  is_ok(): this is Ok<T> {
    return this.match({
      ok: (_: T) => true,
      err: (_: E) => false,
    });
  }

  is_err(): this is Err<E> {
    return !this.is_ok();
  }

  ok(): Option<T> {
    return this.match({
      ok: (x: T) => Some(x),
      err: (_: E) => None(),
    });
  }

  err(): Option<E> {
    return this.match({
      ok: (_: T) => None(),
      err: (e: E) => Some(e),
    });
  }

  map<U>(op: Mapper<T, U>): Result<U, E> {
    return this.match({
      ok: (t: T) => Result.Ok(op(t)),
      err: (e: E) => Result.Err(e),
    });
  }

  map_err<F>(op: Mapper<E, F>): Result<T, F> {
    return this.match({
      ok: (t: T) => Result.Ok(t),
      err: (e: E) => Result.Err(op(e)),
    });
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return this.match({
      ok: (_: T) => res,
      err: (e: E) => Result.Err(e),
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
      return new Result(Ok(op()));
    } catch (error) {
      return new Result(Err(error));
    }
  }

  public static of<T, E>(op: () => T): Result<T, E> {
    return Result.from(op);
  }

  public static async promised<T, E>(p: Promise<T>): Promise<Result<T, E>> {
    try {
      return new Result(Ok(await p));
    } catch (error) {
      return new Result(Err<E>(error));
    }
  }

  public static defer<T, E>(op: () => Promise<T>): Promise<Result<T, E>> {
    return Result.promised<T, E>(op());
  }
}
