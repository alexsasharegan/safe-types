import { Result } from "./result";
import { identity, Mapper, noop } from "./utils";

/**
 * `TaskResolver` is an object that implements the `Ok` and `Err` callback
 * methods. `Ok` should be called with the success value type `T`, while `Err`
 * should be called with the failure value type `E`. The handler callbacks
 * can each return different value types.
 */
export type TaskResolver<OkType, ErrType, OkOutput, ErrOutput> = {
  Ok: (ok: OkType) => OkOutput;
  Err: (err: ErrType) => ErrOutput;
};

/**
 * `TaskExecutorFunc` is the Task operation itself. It receives the
 * `TaskResolver` object as it's first argument. One of the resolver methods
 * must be called or the Task will never complete.
 */
export type TaskExecutorFunc<OkType, ErrType> = (
  resolver: TaskResolver<OkType, ErrType, any, any>
) => any;

/**
 * `Task<T, E>` represents a time-based operation that can resolve with success
 * or error value types `T` or `E` respectively.
 */
export class Task<OkType, ErrType> {
  /**
   * Construct a new Task by passing a function that performs the Task operation
   * itself. The function receives a `TaskResolver` object as it's first
   * argument. One of the resolver methods must be called or the Task will never
   * complete.
   */
  constructor(private executor: TaskExecutorFunc<OkType, ErrType>) {}

  /**
   * `fork` begins execution of the Task and returns a Promise resolving with a
   * `Result` that contains the the return value of your resolver object's
   * corresponding callback.
   */
  public fork<OkOutput, ErrOutput>(
    resolver: TaskResolver<OkType, ErrType, OkOutput, ErrOutput>
  ): Promise<Result<OkOutput, ErrOutput>> {
    let { Ok: map_ok, Err: map_err } = resolver;

    return new Promise<Result<OkOutput, ErrOutput>>(r =>
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
  public run(): Promise<Result<OkType, ErrType>> {
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
  public run_sync(): Result<OkType, ErrType> {
    let r: Result<OkType, ErrType>;

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
   * `exec` immediately executes the task,
   * but discards the resolved value for both success and error cases.
   */
  public exec(): void {
    this.executor({
      Ok: noop,
      Err: noop,
    });
  }

  /**
   * `map` returns a new Task with the success value mapped according to the
   * map function given. `map` should be a synchronous operation.
   */
  public map<MappedOk>(op: Mapper<OkType, MappedOk>): Task<MappedOk, ErrType> {
    return new Task<MappedOk, ErrType>(({ Ok, Err }) =>
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
  public map_err<MappedErr>(
    op: Mapper<ErrType, MappedErr>
  ): Task<OkType, MappedErr> {
    return new Task<OkType, MappedErr>(({ Ok, Err }) =>
      this.executor({
        Ok,
        Err: err => Err(op(err)),
      })
    );
  }

  /**
   * `map_both` returns a new Task that applies the map functions to either the
   * success case or the error case.
   */
  public map_both<MappedOk, MappedErr>(
    bimap: TaskResolver<OkType, ErrType, MappedOk, MappedErr>
  ): Task<MappedOk, MappedErr> {
    return new Task<MappedOk, MappedErr>(({ Ok, Err }) =>
      this.executor({
        Ok: value => Ok(bimap.Ok(value)),
        Err: err => Err(bimap.Err(err)),
      })
    );
  }

  /**
   * `and` composes two Tasks such that `task_b` is forked only if the first
   * task resolves with a success. `task_b` must have the same error type as the
   * first task, but can return a new success type.
   */
  public and<NextOkType>(
    task_b: Task<NextOkType, ErrType>
  ): Task<NextOkType, ErrType> {
    return new Task<NextOkType, ErrType>(({ Ok, Err }) =>
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
  public and_then<NextOkType>(
    op: (ok: OkType) => Task<NextOkType, ErrType>
  ): Task<NextOkType, ErrType> {
    return new Task<NextOkType, ErrType>(({ Ok, Err }) =>
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
  public or<NextErrType>(
    task_b: Task<OkType, NextErrType>
  ): Task<OkType, NextErrType> {
    return new Task<OkType, NextErrType>(({ Ok, Err }) =>
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
  public or_else<NextErrType>(
    op: (err: ErrType) => Task<OkType, NextErrType>
  ): Task<OkType, NextErrType> {
    return new Task<OkType, NextErrType>(({ Ok, Err }) =>
      this.executor({
        Ok,
        Err: err => op(err).fork({ Ok, Err }),
      })
    );
  }

  /**
   * `invert` returns a new Task with the success and error cases swapped.
   */
  public invert(): Task<ErrType, OkType> {
    return new Task<ErrType, OkType>(({ Ok, Err }) =>
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
  public static from<OkType, ErrType>(
    executor: TaskExecutorFunc<OkType, ErrType>
  ): Task<OkType, ErrType> {
    return new Task(executor);
  }

  /**
   * Takes any number of tasks and returns a new Task that will run all tasks
   * concurrently. The first task to fail will trigger the rest to abort.
   */
  public static all<OkType, ErrType>(
    tasks: Task<OkType, ErrType>[]
  ): Task<OkType[], ErrType> {
    return new Task<OkType[], ErrType>(({ Ok, Err }) => {
      const matcher = {
        Ok: (value: OkType) => Promise.resolve(value),
        Err: (error: ErrType) => Promise.reject(error),
      };
      const do_match: (r: Result<OkType, ErrType>) => Promise<OkType> = r =>
        r.match(matcher);
      const run_task = (t: Task<OkType, ErrType>) => t.run().then(do_match);

      Promise.all(tasks.map(run_task))
        .then(Ok)
        .catch(Err);
    });
  }

  /**
   * `collect` returns a new Task that will run an array of Tasks concurrently,
   * collecting all resolved values in a tuple of `[T[], E[]]`.
   *
   * Always resolves Ok.
   */
  public static collect<OkType, ErrType>(
    tasks: Task<OkType, ErrType>[]
  ): Task<[OkType[], ErrType[]], any> {
    return new Task<[OkType[], ErrType[]], void>(async ({ Ok }) => {
      let oks: OkType[] = [];
      let errs: ErrType[] = [];

      let resolver = {
        Ok(value: OkType) {
          oks.push(value);
        },
        Err(error: ErrType) {
          errs.push(error);
        },
      };

      const run_task: (task: Task<OkType, ErrType>) => Promise<any> = t =>
        t.fork(resolver);

      Promise.all(tasks.map(run_task)).then(() => Ok([oks, errs]));
    });
  }

  /**
   * `of_ok` constructs a Task that resolves with a success of the given value.
   */
  public static of_ok<OkType>(value: OkType): Task<OkType, any> {
    return new Task(({ Ok }) => Ok(value));
  }

  /**
   * `of_err` constructs a Task that resolves with an error of the given value.
   */
  public static of_err<ErrType>(err: ErrType): Task<any, ErrType> {
    return new Task(({ Err }) => Err(err));
  }
}
