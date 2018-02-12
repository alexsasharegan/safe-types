import { ResultVariant } from "./variant";
import { Ok } from "./ok";
import { Err } from "./err";
import { Option } from "./option.class";
import { Result } from "./result.class";
import { None } from "./none";
import { Some } from "./some";
import { Mapper } from "./utils";

export type ResultType<T, E> = Ok<T> | Err<E>;

export type ResultMatcher<T, E> = {
  [ResultVariant.Ok]<U>(val: T): U;
  [ResultVariant.Err]<U>(err: E): U;
};

export interface ResultMethods<T, E> {
  /**
   * Returns true if the result is Ok.
   */
  is_ok(): this is Ok<T>;
  /**
   * Returns true if the result is Err.
   */
  is_err(): this is Err<E>;
  /**
   * Converts from Result<T, E> to Option<T>.
   * Converts self into an Option<T>, consuming self,
   * and discarding the error, if any.
   */
  ok(): Option<T>;
  /**
   * Converts from Result<T, E> to Option<E>.
   * Converts self into an Option<E>, consuming self,
   * and discarding the success value, if any.
   */
  err(): Option<E>;
  /**
   * Maps a Result<T, E> to Result<U, E>
   * by applying a function to a contained Ok value,
   * leaving an Err value untouched.
   * This function can be used to compose the results of two functions.
   */
  map<U>(op: Mapper<T, U>): Result<U, E>;
  /**
   * Maps a Result<T, E> to Result<T, F>
   * by applying a function to a contained Err value,
   * leaving an Ok value untouched.
   * This function can be used to pass through
   * a successful result while handling an error.
   */
  map_err<F>(op: Mapper<E, F>): Result<T, F>;
  /**
   * Returns res if the result is Ok, otherwise returns the Err value of self.
   */
  and<U>(res: Result<U, E>): Result<U, E>;
  /**
   * Calls op if the result is Ok, otherwise returns the Err value of self.
   * This function can be used for control flow based on Result values.
   */
  and_then<U>(op: Mapper<T, Result<U, E>>): Result<U, E>;
  /**
   * Returns res if the result is Err, otherwise returns the Ok value of self.
   */
  or<F>(res: Result<T, F>): Result<T, F>;
  /**
   * Calls op if the result is Err, otherwise returns the Ok value of self.
   * This function can be used for control flow based on result values.
   */
  or_else<F>(op: Mapper<E, Result<T, F>>): Result<T, F>;
  /**
   * Unwraps a result, yielding the content of an Ok.
   */
  expect(err_msg: string): T;
  /**
   * Unwraps a result, yielding the content of an Err.
   */
  expect_err(err_msg: string): E;
  /**
   * Unwraps a result, yielding the content of an Ok.
   * Throws if the value is an Err,
   * with an error message provided by the Err's value.
   */
  unwrap(): T;
  /**
   * Unwraps a result, yielding the content of an Ok. Else, it returns optb.
   */
  unwrap_or(optb: T): T;
  /**
   * Unwraps a result, yielding the content of an Ok.
   * If the value is an Err then it calls op with its value.
   */
  unwrap_or_else(op: (err: E) => T): T;
  /**
   * Unwraps a result, yielding the content of an Err.
   */
  unwrap_err(): E;
}

export function is_ok<T, E>(res: ResultType<T, E>): res is Ok<T> {
  return res.variant == ResultVariant.Ok;
}

export function is_err<T, E>(res: ResultType<T, E>): res is Err<E> {
  return res.variant == ResultVariant.Err;
}

export function ok<T, E>(res: ResultType<T, E>): Option<T> {
  if (is_err(res)) {
    return new Option<T>(None());
  }

  return new Option(Some(res.value));
}

export function err<T, E>(res: ResultType<T, E>): Option<E> {
  if (is_ok(res)) {
    return new Option<E>(None());
  }

  return new Option(Some(res.error));
}
