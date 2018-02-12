import {
  ResultType,
  ResultMethods,
  is_ok,
  is_err,
  ok,
  err,
  map,
  // ResultMatcher,
} from "./result.core";
import { Ok } from "./ok";
import { Err } from "./err";
import { Option } from "./option.class";
import { Mapper } from "./utils";

export class Result<T, E> implements ResultMethods<T, E> {
  constructor(public readonly result: ResultType<T, E>) {}

  is_ok(): this is Ok<T> {
    return is_ok(this.result);
  }

  is_err(): this is Err<E> {
    return is_err(this.result);
  }

  ok(): Option<T> {
    return ok(this.result);
  }

  err(): Option<E> {
    return err(this.result);
  }

  map<U>(op: Mapper<T, U>): Result<U, E> {
    return map(this.result, op);
  }

  // match<U>(matcher: ResultMatcher<T, E>): U {
  //   //
  // }

  public static Ok<T>(val: T): Result<T, void> {
    return new Result(Ok(val));
  }

  public static Err<E>(err: E): Result<void, E> {
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

  public static async from_async<T, E>(
    op: () => Promise<T>
  ): Promise<Result<T, E>> {
    try {
      return new Result(Ok(await op()));
    } catch (error) {
      return new Result(Err(error));
    }
  }

  public static of_async<T, E>(op: () => Promise<T>): Promise<Result<T, E>> {
    return Result.from_async<T, E>(op);
  }
}
