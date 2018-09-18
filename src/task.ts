import { Mapper } from "./utils";
import { Result } from "./result";

/**
 * `TaskResolver` is a callback object containing Ok & Err methods for resolving
 * success & failure values respectively.
 */
/**
 * `TaskHandler` is an object that implements the `Ok` and `Err` callback
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
   * task resolves with a success.
   */
  public and<U>(task_b: Task<U, E>): Task<U, E> {
    return new Task<U, E>(({ Ok, Err }) =>
      this.executor({
        Ok: _ => task_b.fork({ Ok, Err }),
        Err,
      })
    );
  }

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

  public static of_ok<T>(value: T): Task<T, void> {
    return new Task(({ Ok }) => Ok(value));
  }

  public static of_err<E>(err: E): Task<void, E> {
    return new Task(({ Err }) => Err(err));
  }
}
