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
  constructor(public executor: TaskExecutorFunc<OkType, ErrType>) {}

  /**
   * `fork` begins execution of the Task and returns a Promise resolving with a
   * `Result` that contains the the return value of your resolver object's
   * corresponding callback.
   */
  public fork<OkOutput, ErrOutput>(
    resolver: TaskResolver<OkType, ErrType, OkOutput, ErrOutput>
  ): Promise<Result<OkOutput, ErrOutput>> {
    let { Ok: mapOk, Err: mapErr } = resolver;

    return new Promise<Result<OkOutput, ErrOutput>>(resolve =>
      this.executor({
        Ok: okValue => resolve(Result.Ok(mapOk(okValue))),
        Err: errValue => resolve(Result.Err(mapErr(errValue))),
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
   * `try` runs a task and resolves with a success value,
   * or throws it's error value.
   */
  public try(): Promise<OkType> {
    return this.run().then(r => r.try());
  }

  /**
   * `tap` allows you to do side-effects with the value
   * when the Task is executed and is on the success path.
   *
   * Essentially a shorthand for doing a `Task.map()` that
   * returns the value it's called with after performing a side-effect.
   */
  public tap(fn: (ok: OkType) => any): Task<OkType, ErrType> {
    return this.map(ok => {
      fn(ok);
      return ok;
    });
  }

  /**
   * `tap_err` allows you to do side-effects with the value
   * when the Task is executed and is on the error path.
   *
   * Essentially a shorthand for doing a `Task.map_err()` that
   * returns the value it's called with after performing a side-effect.
   */
  public tap_err(fn: (err: ErrType) => any): Task<OkType, ErrType> {
    return this.map_err(err => {
      fn(err);
      return err;
    });
  }

  /**
   * `finally` allows you to run a side-effect function
   * in either Ok/Err cases, but does not receive a value.
   */
  public finally(fn: () => any): Task<OkType, ErrType> {
    return new Task(({ Ok, Err }) =>
      this.fork({
        Ok(ok) {
          fn();
          Ok(ok);
        },
        Err(err) {
          fn();
          Err(err);
        },
      })
    );
  }

  /**
   * `map` returns a new Task with the success value mapped according to the
   * map function given. `map` should be a synchronous operation.
   */
  public map<MappedOk>(op: Mapper<OkType, MappedOk>): Task<MappedOk, ErrType> {
    return new Task<MappedOk, ErrType>(({ Ok, Err }) =>
      this.executor({
        Ok: okValue => Ok(op(okValue)),
        Err,
      })
    );
  }

  /**
   * `map_to` returns a new Task with the success value mapped to the static
   * value given.
   */
  public map_to<OkValue>(value: OkValue): Task<OkValue, ErrType> {
    return this.map(() => value);
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
        Err: errValue => Err(op(errValue)),
      })
    );
  }

  /**
   * `map_err_to` returns a new Task with the success value mapped to the static
   * value given.
   */
  public map_err_to<ErrValue>(error: ErrValue): Task<OkType, ErrValue> {
    return this.map_err(() => error);
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
        Ok: okValue => Ok(bimap.Ok(okValue)),
        Err: errValue => Err(bimap.Err(errValue)),
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
   * `and_effect` will compose a Task such that the effect is only executed
   * if the first task resolves with a success. It will resolve with the
   * value of the first task and execute the effect task via `Task.exec`,
   * discarding it's return and leaving the task chain unaffected.
   */
  public and_effect(effect: Task<any, any>): Task<OkType, ErrType> {
    return this.tap(() => {
      effect.exec();
    });
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
        Ok: okValue => op(okValue).fork({ Ok, Err }),
        Err,
      })
    );
  }

  /**
   * `and_then_effect` will compose a Task such that the effect func is only
   * called and executed if the first task resolves with a success.
   * It will resolve with the value of the first task
   * and execute the effect task via `Task.exec`,
   * discarding it's return and leaving the task chain unaffected.
   *
   * **CAUTION:**
   * Mutating the value the effect func is called with will affect the chain.
   */
  public and_then_effect(
    effect_fn: (ok: OkType) => Task<any, any>
  ): Task<OkType, ErrType> {
    return this.tap(x => {
      effect_fn(x).exec();
    });
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
   * `or_effect` will compose a Task such that the effect is only executed
   * if the first task resolves with an error. It will resolve with the
   * value of the first task and execute the effect task via `Task.exec`,
   * discarding it's return and leaving the task chain unaffected.
   */
  public or_effect(effect: Task<any, any>): Task<OkType, ErrType> {
    return this.tap_err(() => {
      effect.exec();
    });
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
        Err: errValue => op(errValue).fork({ Ok, Err }),
      })
    );
  }

  /**
   * `or_else_effect` will compose a Task such that the effect func is only
   * called and executed if the first task resolves with an error.
   * It will resolve with the value of the first task
   * and execute the effect task via `Task.exec`,
   * discarding it's return and leaving the task chain unaffected.
   *
   * **CAUTION:**
   * Mutating the value the effect func is called with will affect the chain.
   */
  public or_else_effect(
    effect_fn: (err: ErrType) => Task<any, any>
  ): Task<OkType, ErrType> {
    return this.tap_err(x => {
      effect_fn(x).exec();
    });
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
        Ok: (okValue: OkType) => Promise.resolve(okValue),
        Err: (errValue: ErrType) => Promise.reject(errValue),
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
   * Takes any number of tasks and returns a new Task that will run all tasks
   * with the specified concurrency.
   * The first task to fail will trigger the rest to abort.
   */
  public static all_concurrent<OkType, ErrType>(
    options: { concurrency: number },
    tasks: Task<OkType, ErrType>[]
  ): Task<OkType[], ErrType> {
    return new Task<OkType[], ErrType>(({ Ok, Err }) => {
      let { concurrency } = options;
      let results: OkType[] = new Array(tasks.length);

      let completed = 0;
      let started = 0;
      let running = 0;
      let error = 0;

      replenish();

      function worker(index: number) {
        tasks[index]
          .tap(ok => {
            running--;
            completed++;
            results[index] = ok;
            replenish();
          })
          .tap_err(err => {
            Err(err);
            error++;
          })
          .exec();
      }

      function replenish() {
        if (completed >= tasks.length) {
          return Ok(results);
        }

        while (running < concurrency && started < tasks.length && error === 0) {
          running++;
          started++;
          worker(started - 1);
        }
      }
    });
  }

  /**
   * `collect` returns a new Task that will run an array of Tasks concurrently,
   * collecting all resolved values in a tuple of `[T[], E[]]`.
   *
   * **NOTE:** Order is not preserved. Always resolves `Ok`.
   */
  public static collect<OkType, ErrType>(
    tasks: Task<OkType, ErrType>[]
  ): Task<[OkType[], ErrType[]], never> {
    return new Task<[OkType[], ErrType[]], never>(async ({ Ok }) => {
      let oks: OkType[] = [];
      let errs: ErrType[] = [];

      let resolver = {
        Ok(okValue: OkType) {
          oks.push(okValue);
        },
        Err(errValue: ErrType) {
          errs.push(errValue);
        },
      };

      const run_task: (task: Task<OkType, ErrType>) => Promise<any> = t =>
        t.fork(resolver);

      Promise.all(tasks.map(run_task)).then(() => Ok([oks, errs]));
    });
  }

  /**
   * `collect_concurrent` returns a new Task that will run an array of Tasks
   * with the specified concurrency,
   * collecting all resolved values in a tuple of `[T[], E[]]`.
   *
   * **NOTE:** Order is not preserved. Always resolves `Ok`.
   */
  public static collect_concurrent<OkType, ErrType>(
    options: { concurrency: number },
    tasks: Task<OkType, ErrType>[]
  ): Task<[OkType[], ErrType[]], never> {
    return new Task(({ Ok }) => {
      let { concurrency } = options;
      let successes: OkType[] = [];
      let errors: ErrType[] = [];
      let succeed = (ok: OkType) => {
        successes.push(ok);
      };
      let fail = (err: ErrType) => {
        errors.push(err);
      };

      let completed = 0;
      let started = 0;
      let running = 0;

      replenish();

      function worker(t: Task<OkType, ErrType>) {
        t.map_both({ Ok: succeed, Err: fail })
          .finally(() => {
            running--;
            completed++;
            replenish();
          })
          .exec();
      }

      function replenish() {
        if (completed >= tasks.length) {
          return Ok([successes, errors]);
        }

        while (running < concurrency && started < tasks.length) {
          running++;
          started++;
          worker(tasks[started - 1]);
        }
      }
    });
  }

  /**
   * `of_ok` constructs a Task that resolves with a success of the given value.
   */
  public static of_ok<OkType>(okValue: OkType): Task<OkType, any> {
    return new Task(({ Ok }) => Ok(okValue));
  }

  /**
   * `of_err` constructs a Task that resolves with an error of the given value.
   */
  public static of_err<ErrType>(errValue: ErrType): Task<any, ErrType> {
    return new Task(({ Err }) => Err(errValue));
  }

  /**
   * Wraps a Task in another Task that will be run until success
   * up to the given limit of tries.
   */
  public static retry<OkType, ErrType>(
    tryLimit: number,
    task: Task<OkType, ErrType>
  ): Task<OkType, ErrType> {
    if (tryLimit < 1 || !Number.isInteger(tryLimit)) {
      throw new RangeError(
        `Task.retry must use an integer try limit greater than zero`
      );
    }

    if (tryLimit === 1) {
      return task;
    }

    return new Task<OkType, ErrType>(async ({ Ok, Err }) => {
      let r: Result<OkType, ErrType>;

      for (let i = 0; i < tryLimit; i++) {
        r = await task.run();
        if (r.is_ok()) {
          break;
        }
      }

      r!.match({ Ok, Err });
    });
  }

  /**
   * Wraps a Task in another Task that will be run until success
   * up to the given limit of tries. After a failed run, exponential backoff
   * is calculated to wait before the next run. Uses exponential backoff
   * with equal jitter.
   */
  public static retryWithBackoff<OkType, ErrType>(
    options: RetryWithBackoffOptions,
    task: Task<OkType, ErrType>
  ): Task<OkType, ErrType> {
    let { msBackoffCap, tryLimit, msBackoffStep } = options;
    if (tryLimit < 1 || !Number.isInteger(tryLimit)) {
      throw new RangeError(
        `Task.retry must use an integer retry number greater than zero`
      );
    }

    if (tryLimit === 1) {
      return task;
    }

    function* backoff() {
      let retries = tryLimit - 1;
      for (let i = 0; i < retries; i++) {
        let equalBackoff = Math.min(msBackoffCap, msBackoffStep * 2 ** i) / 2;
        let jitter = Math.random() * equalBackoff;

        yield equalBackoff + jitter;
      }
    }

    return new Task<OkType, ErrType>(async ({ Ok, Err }) => {
      let r = await task.run();
      if (r.is_ok()) {
        return Ok(r.unwrap());
      }

      for (let ms of backoff()) {
        await new Promise(next => setTimeout(next, ms));
        r = await task.run();
        if (r.is_ok()) {
          break;
        }
      }

      r.match({ Ok, Err });
    });
  }
}

export interface RetryWithBackoffOptions {
  /**
   * Maximum number of runs to perform if Task is not successful.
   */
  tryLimit: number;
  /**
   * The average amount of backoff
   * by which to increase waits between retries (milliseconds).
   */
  msBackoffStep: number;
  /**
   * The maximum wait time between retries (milliseconds).
   */
  msBackoffCap: number;
}
