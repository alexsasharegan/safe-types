import { Err } from "./err";
import { Option } from "./index";
import { Ok } from "./ok";
import {
  always_false,
  always_true,
  expect_never,
  identity,
  Mapper,
  noop,
} from "./utils";
import { ResultVariant } from "./variant";

export type ResultType<OkType, ErrType> = Ok<OkType> | Err<ErrType>;

export interface ResultMatcher<OkType, ErrType, Output> {
  Ok(x: OkType): Output;
  Err(e: ErrType): Output;
}

/**
 * Result is a wrapper type for operations that can succeed or fail.
 * Not all operations throw errors in failure cases. Any value can be an Err.
 * Result simultaneously holds either an `Ok` that holds any type
 * and and `Err` that also can hold any type.
 */
export class Result<OkType, ErrType> {
  /**
   * Warning!
   * --------
   *
   * You should never construct a Result object manually. Use the `Ok` and `Err`
   * helpers to create a Result object from a value.
   */
  constructor(readonly result: ResultType<OkType, ErrType>) {}

  /**
   * Perform a pseudo pattern match on the underlying Ok or Err type.
   * Matches the type and then returns the value of calling the matcher's
   * function with the value.
   */
  public match<Output>(
    matcher: ResultMatcher<OkType, ErrType, Output>
  ): Output {
    switch (this.result.variant) {
      default:
        return expect_never(this.result, "Invalid `Result` variant");
      case ResultVariant.Ok:
        return matcher.Ok(this.result.value);
      case ResultVariant.Err:
        return matcher.Err(this.result.error);
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
  public is_ok(): this is { result: Ok<OkType> } {
    return this.match({
      Ok: always_true,
      Err: always_false,
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
  public is_err(): this is { result: Err<ErrType> } {
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
  public ok(): Option<OkType> {
    return this.match({
      Ok: Option.Some,
      Err: Option.None,
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
  public err(): Option<ErrType> {
    return this.match({
      Ok: Option.None,
      Err: Option.Some,
    });
  }

  /**
   * `tap` allows you to do side-effects with the value
   * when `Result` is `Ok<T>`.
   */
  public tap(fn: (ok: OkType) => any): this {
    this.match({ Err: noop, Ok: fn });

    return this;
  }

  /**
   * `tap_err` allows you to do side-effects with the value
   * when `Result` is `Err<E>`.
   */
  public tap_err(fn: (err: ErrType) => any): this {
    this.match({ Err: fn, Ok: noop });

    return this;
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
  public map<MappedOk>(
    op: Mapper<OkType, MappedOk>
  ): Result<MappedOk, ErrType> {
    return this.match<Result<MappedOk, ErrType>>({
      Ok: t => Result.Ok(op(t)),
      Err: Result.Err,
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
  public map_err<MappedErr>(
    op: Mapper<ErrType, MappedErr>
  ): Result<OkType, MappedErr> {
    return this.match<Result<OkType, MappedErr>>({
      Ok: Result.Ok,
      Err: e => Result.Err(op(e)),
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
  public map_both<MappedOk, MappedErr>(
    ok_op: Mapper<OkType, MappedOk>,
    err_op: Mapper<ErrType, MappedErr>
  ): Result<MappedOk, MappedErr> {
    return this.match({
      Ok: t => Result.Ok(ok_op(t)),
      Err: e => Result.Err(err_op(e)),
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
  public and<NextOkType>(
    res: Result<NextOkType, ErrType>
  ): Result<NextOkType, ErrType> {
    return this.match({
      Ok: () => res,
      Err: Result.Err,
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
  public and_await<NextOkType>(
    res: Promise<Result<NextOkType, ErrType>>
  ): Promise<Result<NextOkType, ErrType>> {
    return this.match({
      Ok: () => res,
      Err: e => Promise.resolve(Result.Err(e)),
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
  public and_then<NextOkType>(
    op: (t: OkType) => Result<NextOkType, ErrType>
  ): Result<NextOkType, ErrType> {
    return this.match<Result<NextOkType, ErrType>>({
      Ok: t => op(t),
      Err: Result.Err,
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
  public and_then_await<NextOkType>(
    op: (t: OkType) => Promise<Result<NextOkType, ErrType>>
  ): Promise<Result<NextOkType, ErrType>> {
    return this.match({
      Ok: op,
      Err: e => Promise.resolve(Result.Err(e)),
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
  public or<NextErrType>(
    res: Result<OkType, NextErrType>
  ): Result<OkType, NextErrType> {
    return this.match({
      Ok: Result.Ok,
      Err: () => res,
    });
  }

  /**
   * Returns the given promised result if the result an Err, or else wraps the
   * existing result in a promise.
   */
  public or_await<NextErrType>(
    res: Promise<Result<OkType, NextErrType>>
  ): Promise<Result<OkType, NextErrType>> {
    return this.match({
      Ok: val => Promise.resolve(Result.Ok(val)),
      Err: () => res,
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
  public or_else<NextErrType>(
    op: (e: ErrType) => Result<OkType, NextErrType>
  ): Result<OkType, NextErrType> {
    return this.match({
      Ok: Result.Ok,
      Err: op,
    });
  }

  /**
   * Calls the given function if the result an Err, or else wraps the
   * existing result in a promise.
   */
  public or_else_await<NextErrType>(
    op: (e: ErrType) => Promise<Result<OkType, NextErrType>>
  ): Promise<Result<OkType, NextErrType>> {
    return this.match({
      Ok: val => Promise.resolve(Result.Ok(val)),
      Err: op,
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
  public unwrap_or(optb: OkType): OkType {
    return this.match({
      Ok: identity,
      Err: () => optb,
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
  public unwrap_or_else(op: (e: ErrType) => OkType): OkType {
    return this.match({
      Ok: identity,
      Err: op,
    });
  }

  /**
   * Returns the Ok type, or throws an Error.
   */
  public unwrap(): OkType {
    return this.match({
      Ok: identity,
      Err: () => {
        throw new Error(`Called 'Result.unwrap()' on ${this.toString()}`);
      },
    });
  }

  /**
   * Returns the Err type, or throws an Error.
   */
  public unwrap_err(): ErrType {
    return this.match({
      Ok: () => {
        throw new Error(`Called 'Result.unwrap_err()' on ${this.toString()}`);
      },
      Err: identity,
    });
  }

  /**
   * Returns the Ok type, or throws an Error with the given message.
   */
  public expect(msg: string): OkType {
    return this.match<OkType>({
      Ok: identity,
      Err() {
        throw new Error(msg);
      },
    });
  }

  /**
   * Returns the Err type, or throws an Error with the given message.
   */
  public expect_err(msg: string): ErrType {
    return this.match<ErrType>({
      Ok() {
        throw new Error(msg);
      },
      Err: identity,
    });
  }

  /**
   * Remaps the result types so the `Ok<T>` becomes `Err<T>`
   * and the `Err<E>` becomes `Ok<E>`
   */
  public invert(): Result<ErrType, OkType> {
    return this.match({
      Ok: Result.Err,
      Err: Result.Ok,
    });
  }

  public toString(): string {
    return this.match({
      Ok: t => `Ok<${JSON.stringify(t)}>`,
      Err: e => `Err<${JSON.stringify(e)}>`,
    });
  }

  /**
   * Returns an Ok result of the given type.
   */
  public static Ok<OkType, ErrType = any>(
    val: OkType
  ): Result<OkType, ErrType> {
    return new Result(Ok(val));
  }

  /**
   * Returns an Err result of the given type.
   */
  public static Err<ErrType, OkType = any>(
    err: ErrType
  ): Result<OkType, ErrType> {
    return new Result(Err(err));
  }

  /**
   * Calls the operation and returns an Ok result
   * or an Err result if an Error is thrown.
   */
  public static from<OkType, ErrType>(
    op: () => OkType
  ): Result<OkType, ErrType> {
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
  public static of<OkType, ErrType>(op: () => OkType): Result<OkType, ErrType> {
    return Result.from(op);
  }

  /**
   * Given an array shaped `Result<T, E>[]`, returns a Result of all the
   * unwrapped values or the first Err.
   * Eager return (returns upon first Err case).
   */
  public static every<OkType, ErrType>(
    results: Result<OkType, ErrType>[]
  ): Result<OkType[], ErrType> {
    let r: Result<OkType, ErrType>;
    let ok: OkType[] = [];
    let error: ErrType;

    const matcher = {
      Ok: (t: OkType) => ok.push(t),
      Err: (e: ErrType) => {
        error = e;
        return 0;
      },
    };

    for (r of results) {
      if (0 == r.match(matcher)) {
        return Result.Err(error!);
      }
    }

    return Result.Ok(ok);
  }

  /**
   * Given an array shaped `Result<T, E>[]`, returns a Result of any the
   * unwrapped values or an Err with the all of the Err values.
   */
  public static some<OkType, ErrType>(
    results: Result<OkType, ErrType>[]
  ): Result<OkType[], ErrType[]> {
    if (results.length == 0) {
      return Result.Ok([]);
    }

    let ok: OkType[] = [];
    let err: ErrType[] = [];
    let r: Result<OkType, ErrType>;

    const matcher = {
      Ok: (t: OkType) => ok.push(t),
      Err: (e: ErrType) => err.push(e),
    };

    for (r of results) {
      r.match(matcher);
    }

    // Any Ok's triggers a success.
    if (ok.length > 0) {
      return Result.Ok(ok);
    }

    return Result.Err(err);
  }

  /**
   * Awaits the Promise and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  public static async await<OkType, ErrType>(
    p: Promise<OkType>
  ): Promise<Result<OkType, ErrType>> {
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
  public static await_fn<OkType, ErrType>(
    op: () => Promise<OkType>
  ): Promise<Result<OkType, ErrType>> {
    return Result.await<OkType, ErrType>(op());
  }

  /**
   * Awaits an array of Promises and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  public static async await_all<OkType, ErrType>(
    ps: Array<Promise<OkType>>
  ): Promise<Result<OkType[], ErrType>> {
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
  public static await_all_fn<OkType, ErrType>(
    op: () => Array<Promise<OkType>>
  ): Promise<Result<OkType[], ErrType>> {
    return Result.await_all(op());
  }
}
