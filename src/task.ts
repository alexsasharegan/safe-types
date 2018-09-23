import { Mapper, identity } from "./utils";
import { Result } from "./result";

/**
 * `TaskResolver` is an object that implements the `Ok` and `Err` callback
 * methods. `Ok` should be called with the success value type `T`, while `Err`
 * should be called with the failure value type `E`. The handler callbacks
 * can each return different value types.
 */
export type TaskResolver<T, E, U, F> = {
  Ok: (ok: T) => U;
  Err: (err: E) => F;
};

/**
 * `TaskExecutorFunc` is the Task operation itself. It receives the
 * `TaskResolver` object as it's first argument. One of the resolver methods
 * must be called or the Task will never complete.
 */
export type TaskExecutorFunc<T, E> = (
  resolver: TaskResolver<T, E, any, any>
) => any;

/**
 * `Task<T, E>` represents a time-based operation that can resolve with success
 * or error value types `T` or `E` respectively.
 */
export class Task<T, E> {
  /**
   * Construct a new Task by passing a function that performs the Task operation
   * itself. The function receives a `TaskResolver` object as it's first
   * argument. One of the resolver methods must be called or the Task will never
   * complete.
   */
  constructor(private executor: TaskExecutorFunc<T, E>) {}

  /**
   * `fork` begins execution of the Task and returns a Promise resolving with a
   * `Result` that contains the the return value of your resolver object's
   * corresponding callback.
   *
   * _`resolver.Ok<U> => Promise<Ok<U>>`_
   *
   * _`resolver.Err<F> => Promise<Err<F>>`_
   */
  public fork<U, F>(resolver: TaskResolver<T, E, U, F>): Promise<Result<U, F>> {
    let { Ok: map_ok, Err: map_err } = resolver;

    return new Promise<Result<U, F>>(r =>
      this.executor({
        Ok: value => r(Result.Ok(map_ok(value))),
        Err: err => r(Result.Err(map_err(err))),
      })
    );
  }

  /**
   * `run` begins execution of the Task and returns a Promise resolving with a
   * `Result` that contains the success or error value of the Task.
   */
  public run(): Promise<Result<T, E>> {
    return this.fork({
      Err: identity,
      Ok: identity,
    });
  }

  /**
   * `run_sync` executes the Task synchronously and returns a `Result` that
   * contains the success or error value of the Task.
   *
   * _NOTE: throws an Error if a callback is not invoked synchronously._
   */
  public run_sync(): Result<T, E> {
    let r: Result<T, E>;

    // The executor is not guaranteed to return anything.
    // We need to use the callbacks to assign our Result.
    this.executor({
      Ok(value) {
        r = Result.Ok(value);
      },
      Err(err) {
        r = Result.Err(err);
      },
    });

    // The first bang `!` is for logical not, the second for definite assignment
    if (!r!) {
      throw new Error(
        `Task.run_sync expects the executor to resolve synchronously.`
      );
    }

    // We've asserted that `r` is definitely assigned
    return r!;
  }

  /**
   * `map` returns a new Task with the success value mapped according to the
   * map function given. `map` should be a synchronous operation.
   */
  public map<U>(op: Mapper<T, U>): Task<U, E> {
    return new Task<U, E>(({ Ok, Err }) =>
      this.executor({
        Ok: value => Ok(op(value)),
        Err,
      })
    );
  }

  /**
   * `map_err` returns a new Task with the error value mapped according to the
   * map function given. `map` should be a synchronous operation.
   */
  public map_err<F>(op: Mapper<E, F>): Task<T, F> {
    return new Task<T, F>(({ Ok, Err }) =>
      this.executor({
        Ok,
        Err: err => Err(op(err)),
      })
    );
  }

  /**
   * `and` composes two Tasks such that `task_b` is forked only if the first
   * task resolves with a success. `task_b` must have the same error type as the
   * first task, but can return a new success type.
   */
  public and<U>(task_b: Task<U, E>): Task<U, E> {
    return new Task<U, E>(({ Ok, Err }) =>
      this.executor({
        Ok: () => task_b.fork({ Ok, Err }),
        Err,
      })
    );
  }

  /**
   * `and_then` accepts a function that takes the success value of the first
   * Task and returns a new Task. This allows for sequencing tasks that depend
   * on the output of a previous task. The new Task must have the same error
   * type as the first task, but can return a new success type.
   */
  public and_then<U>(op: (ok: T) => Task<U, E>): Task<U, E> {
    return new Task<U, E>(({ Ok, Err }) =>
      this.executor({
        Ok: value => op(value).fork({ Ok, Err }),
        Err,
      })
    );
  }

  /**
   * `or` composes two Tasks such that `task_b` is forked only if the first Task
   * resolves with an error. `task_b` must have the same success type as the
   * first task, but can return a new error type.
   */
  public or<F>(task_b: Task<T, F>): Task<T, F> {
    return new Task<T, F>(({ Ok, Err }) =>
      this.executor({
        Ok,
        Err: () => task_b.fork({ Ok, Err }),
      })
    );
  }

  /**
   * `or_else` accepts a function that takes the error value of the first Task
   * and returns a new Task. This allows for sequencing tasks in the case of
   * failure based on the output of a previous task. The new Task must have the
   * same success type as the first task, but can return a new error type.
   */
  public or_else<F>(op: (ok: E) => Task<T, F>): Task<T, F> {
    return new Task<T, F>(({ Ok, Err }) =>
      this.executor({
        Ok,
        Err: err => op(err).fork({ Ok, Err }),
      })
    );
  }

  /**
   * `invert` returns a new Task with the success and error cases swapped.
   */
  public invert(): Task<E, T> {
    return new Task<E, T>(({ Ok, Err }) =>
      this.executor({
        Ok: Err,
        Err: Ok,
      })
    );
  }

  /**
   * Unlike `Result` and `Option` types which know their state and stringify, `Task` cannot
   * since it represent a future value. As such, it just behaves like a generic
   * object for stringify behavior:
   *
```
'[object Task]'
```
   */
  public toString(): string {
    return `[object Task]`;
  }

  /**
   * Construct a new Task by passing a function that performs the Task operation
   * itself. The function receives a `TaskResolver` object as it's first
   * argument. One of the resolver methods must be called or the Task will never
   * complete.
   */
  public static from<T, E>(executor: TaskExecutorFunc<T, E>): Task<T, E> {
    return new Task(executor);
  }

  /**
   * `of_ok` constructs a Task that resolves with a success of the given value.
   */
  public static of_ok<T>(value: T): Task<T, void> {
    return new Task(({ Ok }) => Ok(value));
  }

  /**
   * `of_err` constructs a Task that resolves with an error of the given value.
   */
  public static of_err<E>(err: E): Task<void, E> {
    return new Task(({ Err }) => Err(err));
  }
}
