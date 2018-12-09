// @flow
declare type Mapper<T, U> = (x: T) => U;

declare type $None = {
  +variant: "None",
};
declare type $Some<T> = {
  +variant: "None",
  +value: T,
};

declare type $OptionType<T> = $Some<T> | $None;

declare type $Err<E> = {
  +variant: "Err",
  +error: E,
};
declare type $Ok<T> = {
  +variant: "Ok",
  +value: T,
};

declare type $ResultType<T, E> = $Ok<T> | $Err<E>;

declare export class Option<T> {
  +option: $OptionType<T>;

  constructor(option: $OptionType<T>): Option<T>;

  match<U>(matcher: {
    None(): U,
    Some(val: T): U,
  }): U;
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
  is_some(): boolean;
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
  is_none(): boolean;
  /**
   * Returns the wrapped Some value or throws an Error
   * with the given message.
   */
  expect(msg: string): T;
  /**
   * Returns the wrapped Some value or throws an Error.
   */
  unwrap(): T;
  /**
   * Returns the wrapped Some value or the given default.
   */
  unwrap_or(def: T): T;
  /**
   * Returns the wrapped Some value
   * or calls and returns the result of the given func.
   */
  unwrap_or_else(fn: () => T): T;
  /**
   * `tap` allows you to do side-effects with the value
   * when `Option` is `Some<T>`.
   */
  tap(fn: (x: T) => any): this;
  /**
   * Safely transform the wrapped Some value from `T` => `U`.
   *
   * ```
   * // Transform Option<string> => Option<number>
   * Option.of(maybeStr).map(str => str.trim().length)
   * ```
   */
  map<U>(fn: Mapper<T, U>): Option<U>;
  /**
   * Safely transform the wrapped Some value from `T` => `U`
   * and return the transformed value or a default if wrapped value is None.
   */
  map_or<U>(def: U, fn: Mapper<T, U>): U;
  /**
   * Safely transform the wrapped Some value from `T` => `U`
   * and return the transformed value
   * or call a func to return a default if wrapped value is None.
   */
  map_or_else<U>(def: () => U, fn: Mapper<T, U>): U;
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
  ok_or<E>(err: E): Result<T, E>;
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
  ok_or_else<E>(err: () => E): Result<T, E>;
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
  and<U>(optb: Option<U>): Option<U>;
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
  and_then<U>(fn: (t: T) => Option<U>): Option<U>;
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
  filter(predicate: (t: T) => boolean): Option<T>;
  narrow<U: T>(predicate: (t: T) => boolean): Option<U>;
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
  or(optb: Option<T>): Option<T>;
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
  or_else(fn: () => Option<T>): Option<T>;
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
  into_result(): Result<T, void>;
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
  into_result_err(): Result<void, T>;
  /**
   * Given a nullable value of T (`T | undefined | null`),
   * returns an Option<T>
   */
  static from<T>(val: ?T): Option<T>;
  /**
   * Given a nullable value of T (`T | undefined | null`),
   * returns an Option<T>
   */
  static of<T>(val: ?T): Option<T>;
  /**
   * Given an array shaped `Option<T>[]`, returns an Option of all the unwrapped
   * values or None.
   * Eager return (returns upon first None case).
   */
  static every<T>(options: Option<T>[]): Option<T[]>;
  /**
   * Given an array shaped `Option<T>[]`, returns an Option of any the unwrapped
   * values or None.
   */
  static some<T>(options: Option<T>[]): Option<T[]>;
  /**
   * Creates an Option<T> from a known value T.
   */
  static Some<T>(val: T): Option<T>;
  /**
   * Creates an Option<any> from nothing.
   */
  static None(): Option<any>;
}

/**
 * Result is a wrapper type for operations that can succeed or fail.
 * Not all operations throw errors in failure cases. Any value can be an Err.
 * Result simultaneously holds either an `Ok` that holds any type
 * and and `Err` that also can hold any type.
 */
declare export class Result<T, E> {
  +result: $ResultType<T, E>;
  constructor(result: $ResultType<T, E>): Result<T, E>;
  /**
   * Perform a pseudo pattern match on the underlying Ok or Err type.
   * Matches the type and then returns the value of calling the matcher's
   * function with the value.
   */
  match<U>(matcher: {
    Ok: (x: T) => U,
    Err: (e: E) => U,
  }): U;
  /**
   * Returns true if the underlying type is an Ok.
   *
   * ```
   * let result = Ok(2)
   * result.is_ok()
   * // => true
   * ```
   */
  is_ok(): boolean;
  /**
   * Returns true if the underlying type is an Err.
   *
   * ```
   * let result = Ok(2)
   * result.is_err()
   * // => false
   * ```
   */
  is_err(): boolean;
  /**
   * Returns an Option of the Ok type.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.ok()
   * // => Option<string>
   * ```
   */
  ok(): Option<T>;
  /**
   * Returns an Option of the Err type.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.err()
   * // => Option<Error>
   * ```
   */
  err(): Option<E>;
  /**
   * `tap` allows you to do side-effects with the value
   * when `Result` is `Ok<T>`.
   */
  tap(fn: (x: T) => any): this;
  /**
   * `tap_err` allows you to do side-effects with the value
   * when `Result` is `Err<E>`.
   */
  tap_err(fn: (x: E) => any): this;
  /**
   * Perform a transformation on the possible Ok type.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.map(str => str.length)
   * // => Result<number, Error>
   * ```
   */
  map<U>(op: Mapper<T, U>): Result<U, E>;
  /**
   * Perform a transformation on the possible Err type.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.map_err(err => err.message)
   * // => Result<string, string>
   * ```
   */
  map_err<F>(op: Mapper<E, F>): Result<T, F>;
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
  map_both<U, F>(ok_op: Mapper<T, U>, err_op: Mapper<E, F>): Result<U, F>;
  /**
   * Swaps the result's Ok type with the given result if Ok.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.and(readFileSync("bar.txt"))
   * // => Result<string, Error>
   * ```
   */
  and<U>(res: Result<U, E>): Result<U, E>;
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
  and_await<U>(res: Promise<Result<U, E>>): Promise<Result<U, E>>;
  /**
   * Calls the given operation and swaps the Ok type if Ok.
   *
   * ```
   * let read_result: Result<string, Error> = readFileSync("foo.txt")
   * read_result.and_then(contents => readFileSync(contents.match(/\.txt$/)[1]))
   * // => Result<string, Error>
   * ```
   */
  and_then<U>(op: (t: T) => Result<U, E>): Result<U, E>;
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
  and_then_await<U>(op: (t: T) => Promise<Result<U, E>>): Promise<Result<U, E>>;
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
  or<F>(res: Result<T, F>): Result<T, F>;
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
  or_else<F>(op: (e: E) => Result<T, F>): Result<T, F>;
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
  unwrap_or(optb: T): T;
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
  unwrap_or_else(op: (e: E) => T): T;
  /**
   * Returns the Ok type, or throws an Error.
   */
  unwrap(): T;
  /**
   * Returns the Err type, or throws an Error.
   */
  unwrap_err(): E;
  /**
   * Returns the Ok type, or throws an Error with the given message.
   */
  expect(msg: string): T;
  /**
   * Returns the Err type, or throws an Error with the given message.
   */
  expect_err(msg: string): E;
  /**
   * Remaps the result types so the `Ok<T>` becomes `Err<T>`
   * and the `Err<E>` becomes `Ok<E>`
   */
  invert(): Result<E, T>;
  /**
   * Returns an Ok result of the given type.
   */
  static Ok<T, E: any>(val: T): Result<T, E>;
  /**
   * Returns an Err result of the given type.
   */
  static Err<E, T: any>(err: E): Result<T, E>;
  /**
   * Calls the operation and returns an Ok result
   * or an Err result if an Error is thrown.
   */
  static from<T, E>(op: () => T): Result<T, E>;
  /**
   * Calls the operation and returns an Ok result
   * or an Err result if an Error is thrown.
   */
  static of<T, E>(op: () => T): Result<T, E>;
  /**
   * Given an array shaped `Result<T, E>[]`, returns a Result of all the
   * unwrapped values or the first Err.
   * Eager return (returns upon first Err case).
   */
  static every<T, E>(results: Result<T, E>[]): Result<T[], E>;
  /**
   * Given an array shaped `Result<T, E>[]`, returns a Result of any the
   * unwrapped values or an Err with the all of the Err values.
   */
  static some<T, E>(results: Result<T, E>[]): Result<T[], E[]>;
  /**
   * Awaits the Promise and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  static await<T, E>(p: Promise<T>): Promise<Result<T, E>>;
  /**
   * Calls the async operation and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  static await_fn<T, E>(op: () => Promise<T>): Promise<Result<T, E>>;
  /**
   * Awaits an array of Promises and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  static await_all<T, E>(ps: Array<Promise<T>>): Promise<Result<T[], E>>;
  /**
   * Calls the async operation and returns a Promised Ok result
   * or a Promised Err result if an Error is thrown.
   */
  static await_all_fn<T, E>(
    op: () => Array<Promise<T>>
  ): Promise<Result<T[], E>>;
}

declare export function Some<T>(x: T): Option<T>;
declare export function None(): Option<any>;

declare export function Ok<T, E: any>(x: T): Result<T, E>;
declare export function Err<E, T: any>(e: E): Result<T, E>;

declare export var OptionVariant: {
  Some: "Some",
  None: "None",
};

declare export var ResultVariant: {
  Ok: "Ok",
  Err: "Err",
};

declare export function is_void(val: any): boolean;
declare export function is_never(_: empty): empty;
declare export function expect_never(_: empty, err_msg: string): empty;
declare export function get_at_path(
  obj: {
    [key: string]: any,
  },
  path: string[]
): Option<any>;
declare export function has_at_path(
  obj: {
    [key: string]: any,
  },
  path: string[]
): boolean;
declare export function err_or_ok<E, T>(err: ?E, ok: T): Result<T, E>;

/**
 * `TaskResolver` is an object that implements the `Ok` and `Err` callback
 * methods. `Ok` should be called with the success value type `T`, while `Err`
 * should be called with the failure value type `E`. The handler callbacks
 * can each return different value types.
 */
declare type TaskResolver<T, E, U, F> = {
  Ok: (ok: T) => U,
  Err: (err: E) => F,
};
/**
 * `TaskExecutorFunc` is the Task operation itself. It receives the
 * `TaskResolver` object as it's first argument. One of the resolver methods
 * must be called or the Task will never complete.
 */
declare type TaskExecutorFunc<T, E> = (
  resolver: TaskResolver<T, E, any, any>
) => any;
/**
 * `Task<T, E>` represents a time-based operation that can resolve with success
 * or error value types `T` or `E` respectively.
 */
declare export class Task<T, E> {
  +executor: TaskExecutorFunc<T, E>;
  /**
   * Construct a new Task by passing a function that performs the Task operation
   * itself. The function receives a `TaskResolver` object as it's first
   * argument. One of the resolver methods must be called or the Task will never
   * complete.
   */
  constructor(executor: TaskExecutorFunc<T, E>): Task<T, E>;
  /**
   * `fork` begins execution of the Task and returns a Promise resolving with a
   * `Result` that contains the the return value of your resolver object's
   * corresponding callback.
   *
   * _`resolver.Ok<U> => Promise<Ok<U>>`_
   *
   * _`resolver.Err<F> => Promise<Err<F>>`_
   */
  fork<U, F>(resolver: TaskResolver<T, E, U, F>): Promise<Result<U, F>>;
  /**
   * `run` begins execution of the Task and returns a Promise resolving with a
   * `Result` that contains the success or error value of the Task.
   */
  run(): Promise<Result<T, E>>;
  /**
   * `run_sync` executes the Task synchronously and returns a `Result` that
   * contains the success or error value of the Task.
   *
   * _NOTE: throws an Error if a callback is not invoked synchronously._
   */
  run_sync(): Result<T, E>;
  /**
   * `map` returns a new Task with the success value mapped according to the
   * map function given. `map` should be a synchronous operation.
   */
  map<U>(op: Mapper<T, U>): Task<U, E>;
  /**
   * `map_err` returns a new Task with the error value mapped according to the
   * map function given. `map` should be a synchronous operation.
   */
  map_err<F>(op: Mapper<E, F>): Task<T, F>;
  /**
   * `map_both` returns a new Task that applies the map functions to either the
   * success case or the error case.
   */
  map_both<U, F>(bimap: TaskResolver<T, E, U, F>): Task<U, F>;
  /**
   * `and` composes two Tasks such that `task_b` is forked only if the first
   * task resolves with a success. `task_b` must have the same error type as the
   * first task, but can return a new success type.
   */
  and<U>(task_b: Task<U, E>): Task<U, E>;
  /**
   * `and_then` accepts a function that takes the success value of the first
   * Task and returns a new Task. This allows for sequencing tasks that depend
   * on the output of a previous task. The new Task must have the same error
   * type as the first task, but can return a new success type.
   */
  and_then<U>(op: (ok: T) => Task<U, E>): Task<U, E>;
  /**
   * `or` composes two Tasks such that `task_b` is forked only if the first Task
   * resolves with an error. `task_b` must have the same success type as the
   * first task, but can return a new error type.
   */
  or<F>(task_b: Task<T, F>): Task<T, F>;
  /**
   * `or_else` accepts a function that takes the error value of the first Task
   * and returns a new Task. This allows for sequencing tasks in the case of
   * failure based on the output of a previous task. The new Task must have the
   * same success type as the first task, but can return a new error type.
   */
  or_else<F>(op: (ok: E) => Task<T, F>): Task<T, F>;
  /**
   * `invert` returns a new Task with the success and error cases swapped.
   */
  invert(): Task<E, T>;
  /**
   * Unlike `Result` and `Option` types which know their state and stringify, `Task` cannot
   * since it represent a future value. As such, it just behaves like a generic
   * object for stringify behavior:
   *
```
'[object Task]'
```
   */
  toString(): string;
  /**
   * Takes any number of tasks and returns a new Task that will run all tasks
   * concurrently. The first task to fail will trigger the rest to abort.
   */
  static all<T, E>(tasks: Task<T, E>[]): Task<T[], E>;
  /**
   * `collect` returns a new Task that will run an array of Tasks concurrently,
   * collecting all resolved values in a tuple of `[T[], E[]]`.
   *
   * Always resolves Ok.
   */
  static collect<T, E>(tasks: Task<T, E>[]): Task<[T[], E[]], any>;
  /**
   * Construct a new Task by passing a function that performs the Task operation
   * itself. The function receives a `TaskResolver` object as it's first
   * argument. One of the resolver methods must be called or the Task will never
   * complete.
   */
  static from<T, E>(executor: TaskExecutorFunc<T, E>): Task<T, E>;
  /**
   * `of_ok` constructs a Task that resolves with a success of the given value.
   */
  static of_ok<T>(value: T): Task<T, any>;
  /**
   * `of_err` constructs a Task that resolves with an error of the given value.
   */
  static of_err<E>(err: E): Task<any, E>;
}
