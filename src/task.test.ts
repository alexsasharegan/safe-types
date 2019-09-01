import { Result, Task } from "./index";

describe("Task", () => {
  it("should return Task instance", async () => {
    let t = new Task(() => {});
    expect(t).toBeInstanceOf(Task);

    t = Task.from(() => {});
    expect(t).toBeInstanceOf(Task);
  });

  describe("Task.fork", () => {
    it("success", async () => {
      const value = "success";

      let Ok = jest.fn(x => x);

      let t = Task.from<typeof value, void>(r => Promise.resolve(r.Ok(value)));
      let p = t.fork({
        Ok,
        Err: console.error,
      });

      expect(p instanceof Promise).toBe(true);

      let r = await p;
      expect(Ok).toHaveBeenCalledWith(value);
      expect(r).toEqual(Result.Ok(value));
    });

    it("error", async () => {
      const value = "error";

      let Err = jest.fn(x => x);

      let t = Task.from<void, typeof value>(r => Promise.resolve(r.Err(value)));
      let r = await t.fork({
        Ok: console.error,
        Err,
      });

      expect(Err).toHaveBeenCalledWith(value);
      expect(r).toEqual(Result.Err(value));
    });
  });

  describe("Task.run", () => {
    it("success", async () => {
      const final = "success";
      expect(await Task.from<string, void>(r => r.Ok(final)).run()).toEqual(
        Result.Ok(final)
      );
    });

    it("error", async () => {
      const final = "error";
      expect(await Task.from<void, string>(r => r.Err(final)).run()).toEqual(
        Result.Err(final)
      );
    });
  });

  describe("Task.run_sync", () => {
    it("success", async () => {
      const final = "success";
      expect(Task.from<string, void>(r => r.Ok(final)).run_sync()).toEqual(
        Result.Ok(final)
      );
    });

    it("error", async () => {
      const final = "error";
      expect(Task.from<void, string>(r => r.Err(final)).run_sync()).toEqual(
        Result.Err(final)
      );
    });

    it("no sync callback Error", async () => {
      let task_bomb = Task.from<string, void>(async r => {
        await new Promise(r => setTimeout(r, 10));
        r.Ok("#boom");
      });

      const fn = () => {
        task_bomb.run_sync();
      };

      expect(fn).toThrowErrorMatchingSnapshot();
    });
  });

  describe("Task.exec", () => {
    it("success", async () => {
      let spy = jest.fn();
      let task = new Task<any, any>(r => {
        r.Ok(spy());
      });
      task.exec();
      expect(spy).toHaveBeenCalled();
    });

    it("error", async () => {
      let spy = jest.fn();
      let task = new Task<any, any>(r => {
        r.Err(spy());
      });
      task.exec();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("Side effect mappings", () => {
    it("Task.tap", async () => {
      let task = Task.of_ok(1);
      let spy = jest.fn();

      let r = await task.tap(spy).run();
      expect(spy).toHaveBeenCalledWith(1);
      expect(r).toEqual(Result.Ok(1));
    });

    it("Task.tap_err", async () => {
      let task = Task.of_err(1);
      let spy = jest.fn();

      let r = await task.tap_err(spy).run();
      expect(spy).toHaveBeenCalledWith(1);
      expect(r).toEqual(Result.Err(1));
    });

    it("Task.finally", async () => {
      let spy = jest.fn();
      await Task.of_err(1)
        .finally(spy)
        .run();
      await Task.of_ok(1)
        .finally(spy)
        .run();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  it("Task.map", async () => {
    const a = "a test";
    let t = Task.from<string, string>(r => r.Ok(a)).map(s => s.toUpperCase());

    const never = jest.fn();

    await t.fork({
      Ok(result) {
        expect(result).toBe(a.toUpperCase());
      },
      Err: never,
    });

    expect(never).not.toHaveBeenCalled();
  });

  it("Task.map_to", async () => {
    let ok = Task.of_ok(1);
    let err = Task.of_err(1);
    let mapTo = 2;
    expect(await ok.map_to(mapTo).run()).toEqual(Result.Ok(mapTo));
    expect(await err.map_to(mapTo).run()).not.toEqual(Result.Ok(mapTo));
  });

  it("Task.map_err", async () => {
    const a = "a test";
    let t = Task.from<void, string>(r => r.Err(a)).map_err(s => new Error(s));

    const never = jest.fn();

    await t.fork({
      Ok: never,
      Err(result) {
        expect(result).toEqual(new Error(a));
      },
    });

    expect(never).not.toHaveBeenCalled();
  });

  it("Task.map_err_to", async () => {
    let ok = Task.of_ok(1);
    let err = Task.of_err(1);
    let mapTo = 2;
    expect(await err.map_err_to(mapTo).run()).toEqual(Result.Err(mapTo));
    expect(await ok.map_err_to(mapTo).run()).not.toEqual(Result.Err(mapTo));
  });

  it("Task.map_both", async () => {
    const success = "success";
    const error = "error";

    const toUpper = (s: string) => s.toUpperCase();

    let task_ok = Task.of_ok(success);
    let task_err = Task.of_err(error);

    expect(await task_ok.map_both({ Ok: toUpper, Err: x => x }).run()).toEqual(
      Result.Ok(success.toUpperCase())
    );
    expect(await task_err.map_both({ Ok: x => x, Err: toUpper }).run()).toEqual(
      Result.Err(error.toUpperCase())
    );
  });

  it("Task.invert", async () => {
    const success = "success";
    const error = "error";

    let task_ok = new Task<string, void>(r => r.Ok(success));
    let task_err = new Task<void, string>(r => r.Err(error));

    expect(await task_ok.invert().run()).toEqual(Result.Err(success));
    expect(await task_err.invert().run()).toEqual(Result.Ok(error));
  });

  it("Task.and", async () => {
    const a = "a test";
    const b = "b test";

    let task_a = new Task<string, void>(r => r.Ok(a));
    let task_b = new Task<string, void>(r => r.Ok(b));

    let task_a_and_b = task_a.and(task_b);

    // ensure new, composed task is returned
    expect(task_a !== task_a_and_b).toBe(true);
    expect(task_b !== task_a_and_b).toBe(true);

    await task_a_and_b.fork({
      Ok(x) {
        expect(x).toBe(b);
      },
      Err() {
        throw new Error();
      },
    });
  });

  it("Task.and_then", async () => {
    const a = "123";

    let task_a = new Task<string, Error>(r => r.Ok(a));

    let composed = task_a.and_then(s =>
      Task.from<number, Error>(r => {
        let n = parseInt(s, 10);
        if (Number.isNaN(n)) {
          return r.Err(new Error("NaN"));
        }

        r.Ok(n);
      })
    );

    await composed.fork({
      Ok(n) {
        expect(n).toBe(123);
      },
      Err(e) {
        throw e;
      },
    });
  });

  describe("Side effect Ok tasks", () => {
    it("Task.and_effect", async () => {
      let task = Task.of_ok(1);
      let spy = jest.fn();
      let effect = new Task<string, any>(r => {
        spy();
        r.Ok(`I'm a side-effect`);
      });

      let r = await task.and_effect(effect).run();
      expect(spy).toHaveBeenCalled();
      expect(r).toEqual(Result.Ok(1));
    });

    it("Task.and_then_effect", async () => {
      let task = Task.of_ok(1);
      let effect_fn = jest.fn(() => Task.of_ok(`I'm a side-effect`));

      let r = await task.and_then_effect(effect_fn).run();
      expect(effect_fn).toHaveBeenCalledWith(1);
      expect(r).toEqual(Result.Ok(1));
    });
  });

  it("Task.or", async () => {
    const final = "Or success";
    let task_a = new Task<string, number>(r => r.Err(1));
    let task_b = new Task<string, Error>(r => r.Ok(final));
    let task_c = new Task<string, Error>(r => r.Err(new Error(final)));

    await task_a.or(task_b).fork({
      Ok(x) {
        expect(x).toBe(final);
      },
      Err(e) {
        throw e;
      },
    });

    await task_a.or(task_c).fork({
      Ok(x) {
        throw x;
      },
      Err(e) {
        expect(e).toEqual(new Error(final));
      },
    });
  });

  it("Task.or_else", async () => {
    let task_a = new Task<string, number>(r => r.Err(1));

    await task_a
      .or_else(n => new Task<string, string>(r => r.Ok(n.toString(10))))
      .fork({
        Ok(x) {
          expect(x).toBe("1");
        },
        Err(e) {
          throw e;
        },
      });

    await task_a
      .or_else(n => new Task<string, string>(r => r.Err(n.toString(10))))
      .fork({
        Ok(x) {
          throw x;
        },
        Err(e) {
          expect(e).toBe("1");
        },
      });
  });

  describe("Side effect Err tasks", () => {
    it("Task.or_effect", async () => {
      let task = Task.of_err(1);
      let spy = jest.fn();
      let effect = new Task<string, any>(r => {
        spy();
        r.Ok(`I'm a side-effect`);
      });

      let r = await task.or_effect(effect).run();
      expect(spy).toHaveBeenCalled();
      expect(r).toEqual(Result.Err(1));
    });

    it("Task.or_else_effect", async () => {
      let task = Task.of_err(1);
      let effect_fn = jest.fn(() => Task.of_ok(`I'm a side-effect`));

      let r = await task.or_else_effect(effect_fn).run();
      expect(effect_fn).toHaveBeenCalledWith(1);
      expect(r).toEqual(Result.Err(1));
    });
  });

  it("Task.all", async () => {
    const task_mapper = (_: any, i: number) =>
      new Task<number, number>(({ Ok, Err }) => {
        let n = i + 1;
        if (n > 5) {
          Promise.resolve(n).then(Err);
        } else {
          Promise.resolve(n).then(Ok);
        }
      });

    let r = await Task.all(Array.from({ length: 5 }, task_mapper)).run();
    expect(r).toEqual(Result.Ok([1, 2, 3, 4, 5]));

    r = await Task.all(Array.from({ length: 10 }, task_mapper)).run();
    expect(r.is_err()).toBe(true);
    expect(r.unwrap_err()).toBeGreaterThan(5);

    // Test base empty case
    expect(await Task.all([]).try()).toEqual([]);
  });

  it("Task.collect", async () => {
    const task_mapper = (_: any, i: number) =>
      new Task<number, number>(({ Ok, Err }) => {
        let n = i + 1;
        if (n > 5) {
          Promise.resolve(n).then(Err);
        } else {
          Promise.resolve(n).then(Ok);
        }
      });

    let r = await Task.collect(Array.from({ length: 5 }, task_mapper)).run();
    expect(r).toEqual(Result.Ok([[1, 2, 3, 4, 5], []]));

    r = await Task.collect(Array.from({ length: 10 }, task_mapper)).run();
    expect(r.is_err()).toBe(false);
    expect(r.unwrap()).toEqual([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]]);
    // Test base empty case
    expect(await Task.collect([]).try()).toEqual([[], []]);
  });

  it("Task.of_ok", async () => {
    await Task.of_ok(1).fork({
      Ok(x) {
        expect(x).toBe(1);
      },
      Err() {
        throw new Error();
      },
    });
  });

  it("Task.of_err", async () => {
    await Task.of_err(1).fork({
      Ok() {
        throw new Error();
      },
      Err(x) {
        expect(x).toBe(1);
      },
    });
  });

  it("should toString", async () => {
    expect(String(Task.from(() => {}))).toMatchSnapshot();
  });

  describe("Task.retry", () => {
    it("should not allow invariants", async () => {
      let tt = [0, -1, 1.1, 0.5];

      function doRetry(n: number) {
        return () => Task.retry(n, Task.of_ok(1));
      }

      for (let tc of tt) {
        expect(doRetry(tc)).toThrow();
      }
    });

    it("should run up to n times", async () => {
      let tryLimit = 3;
      let err = `always error`;
      let spy = jest.fn(() => err);
      let task = Task.from(resolve => resolve.Err(spy()));

      expect(await Task.retry(tryLimit, task).run()).toEqual(Result.Err(err));
      expect(spy).toHaveBeenCalledTimes(tryLimit);
    });

    it("should skip unnecessary retries", async () => {
      let tryLimit = 4;
      let x = `a value`;
      let spy = jest.fn(() => x);
      let i = 0;
      let task = Task.from(resolve => {
        if (++i < 2) {
          return resolve.Err(spy());
        }

        resolve.Ok(spy());
      });

      expect(await Task.retry(tryLimit, task).run()).toEqual(Result.Ok(x));
    });

    it("should not retry on initial success", async () => {
      let spy = jest.fn(() => true);
      let task = Task.from(resolve => resolve.Ok(spy()));
      expect(await Task.retry(10, task).run()).toEqual(Result.Ok(true));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should return the same task when the try limit is 1", async () => {
      let task = Task.of_ok(1);
      expect(Task.retry(1, task)).toBe(task);
    });
  });

  describe("Task.retryWithBackoff", () => {
    let msBackoffCap = 50;
    let msBackoffStep = 5;

    it("should not allow invariants", async () => {
      let tt = [0, -1, 1.1, 0.5];

      function doRetry(n: number) {
        return () =>
          Task.retryWithBackoff(
            { msBackoffCap, msBackoffStep, tryLimit: n },
            Task.of_ok(1)
          );
      }

      for (let tc of tt) {
        expect(doRetry(tc)).toThrow();
      }
    });

    it("should run up to n times", async () => {
      let tryLimit = 3;
      let err = `always error`;
      let spy = jest.fn(() => err);
      let task = Task.from(resolve => resolve.Err(spy()));

      expect(
        await Task.retryWithBackoff(
          { tryLimit, msBackoffCap, msBackoffStep },
          task
        ).run()
      ).toEqual(Result.Err(err));
      expect(spy).toHaveBeenCalledTimes(tryLimit);
    });

    it("should wait between tasks", async () => {
      let tryLimit = 4;
      let msBackoffCap = 1000;
      // Larger steps are less flaky. 100ms seems to be the lowest stable value.
      let msBackoffStep = 100;

      let timeBuf: number[] = [];
      let retriable = Task.retryWithBackoff(
        { msBackoffCap, msBackoffStep, tryLimit },
        new Task<never, number>(resolve => {
          resolve.Err(timeBuf.push(Date.now()));
        })
      );

      await retriable.run();
      // Ensure all the runs generated time stamps.
      expect(timeBuf.length).toEqual(tryLimit);

      /**
       * Exponential backoff means that we will increase our backoff step by 2^i.
       * If our step is 10, here is what a series of 5 would look like:
       *
       * - [0] 10 * 2 ** 0 = 10
       * - [1] 10 * 2 ** 1 = 20
       * - [2] 10 * 2 ** 2 = 40
       * - [3] 10 * 2 ** 3 = 80
       * - [4] 10 * 2 ** 4 = 160
       *
       * Since we're using equal jitter, each step uses the values above,
       * but divided in half. One half is preserved, while the other half
       * is multiplied by a random value between 0-1. This means each step
       * could produce a value in a range:
       *
       * - [0] = 5-10
       * - [1] = 10-20
       * - [2] = 20-40
       * - [3] = 40-80
       * - [4] = 80-160
       *
       * The range of each step is bounded by the backoff cap. With this info,
       * we can test our timestamps to be within this range for our options.
       */

      let diffs = [];
      // Calculate the time between each timestamp
      for (let i = 1; i < timeBuf.length; i++) {
        diffs.push(Math.abs(timeBuf[i] - timeBuf[i - 1]));
      }

      // Timers are highly imprecise. Incorporate a margin of error.
      let margin = 10;
      for (let [i, diff] of diffs.entries()) {
        // ensure our time between runs stays properly bounded
        expect(diff).toBeLessThanOrEqual(msBackoffCap + margin);

        let expBackoff = msBackoffStep * 2 ** i;

        // check our lower bound as long as it's less than our cap
        if (expBackoff / 2 < msBackoffCap) {
          // the step should increase by at minimum our lower half exponential backoff
          expect(diff).toBeGreaterThanOrEqual(expBackoff / 2 - margin);
        }

        // check our upper bound as long as it's less than our cap
        if (expBackoff < msBackoffCap) {
          // the should increase by at maximum our upper half exponential backoff
          expect(diff).toBeLessThanOrEqual(expBackoff + margin);
        }
      }
    });

    it("should skip unnecessary retries", async () => {
      let tryLimit = 4;
      let x = `a value`;
      let spy = jest.fn(() => x);
      let i = 0;
      let task = Task.from(resolve => {
        if (++i < 2) {
          return resolve.Err(spy());
        }

        resolve.Ok(spy());
      });

      expect(
        await Task.retryWithBackoff(
          { tryLimit, msBackoffCap, msBackoffStep },
          task
        ).run()
      ).toEqual(Result.Ok(x));
    });

    it("should not retry on initial success", async () => {
      let spy = jest.fn(() => true);
      let task = Task.from(resolve => resolve.Ok(spy()));
      expect(
        await Task.retryWithBackoff(
          { msBackoffCap, msBackoffStep, tryLimit: 10 },
          task
        ).run()
      ).toEqual(Result.Ok(true));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should return the same task when the try limit is 1", async () => {
      let task = Task.of_ok(1);
      expect(
        Task.retryWithBackoff(
          { msBackoffCap, msBackoffStep, tryLimit: 1 },
          task
        )
      ).toBe(task);
    });
  });

  describe("Task.try", () => {
    it("should resolve when ok", async () => {
      let t = Task.from(async ({ Ok }) => Ok(1));
      expect(await t.try()).toEqual(1);
    });

    it("should throw err value when err", async () => {
      let t = Task.from(async ({ Err }) => Err(1));
      await expect(t.try()).rejects.toEqual(1);
    });
  });

  describe("Task.then (Promise A+)", () => {
    it("should be coercible to a Promise", async () => {
      let t1: Task<1, any> = Task.of_ok(1);
      expect(await t1).toBe(1);

      let t2: Task<any, 1> = Task.of_err(1);
      await expect(t2).rejects.toBe(1);
    });

    it("should chain .then", async () => {
      let t1: Task<1, any> = Task.of_ok(1);

      expect(await t1.then(x => x + 1)).toBe(2);
      expect(await t1.then(x => `${x}`)).toBe("1");
      expect(await t1.then(x => `${x}`)).not.toBe(1);
    });
  });

  describe("Task.all_concurrent", () => {
    it("should not exceed concurrency", async () => {
      let running = 0;
      let max = 0;
      let concurrency = 4;
      let duration = 100;
      let length = 32;
      let numbers = Array.from({ length }).map((_, i) => i);

      let tasks = numbers.map(index =>
        new Task<number, never>(({ Ok }) => {
          running++;
          max = Math.max(max, running);
          setTimeout(() => Ok(index), duration);
        }).finally(() => {
          running--;
        })
      );

      let start = Date.now();
      let results = await Task.all_concurrent({ concurrency }, tasks).try();
      let time = Date.now() - start;

      expect(results).toEqual(numbers);
      expect(running).toBe(0);
      expect(max).toBe(concurrency);
      expect(time).toBeGreaterThanOrEqual((length / concurrency) * duration);
      expect(time).toBeLessThanOrEqual(
        (length / concurrency) * duration + duration
      );
    });

    it("should fail when 1 task fails", async () => {
      let length = 32;
      let numbers = Array.from({ length }).map((_, i) => i + 1);

      let t1 = numbers.map(i => (i == 32 ? Task.of_err(i) : Task.of_ok(i)));
      let t2 = numbers.map(i => (i == 1 ? Task.of_err(i) : Task.of_ok(i)));
      let t3 = numbers.map(i => (i == 17 ? Task.of_err(i) : Task.of_ok(i)));

      let r1 = await Task.all_concurrent({ concurrency: 4 }, t1).run();
      expect(r1).toEqual(Result.Err(32));

      let r2 = await Task.all_concurrent({ concurrency: 4 }, t2).run();
      expect(r2).toEqual(Result.Err(1));

      let r3 = await Task.all_concurrent({ concurrency: 4 }, t3).run();
      expect(r3).toEqual(Result.Err(17));
    });

    it("should work with an empty array", async () => {
      let task = Task.all_concurrent({ concurrency: 12 }, []);
      expect(await task.try()).toEqual([]);
    });
  });

  describe("Task.collect_concurrent", () => {
    it("should not exceed concurrency", async () => {
      let running = 0;
      let max = 0;
      let concurrency = 4;
      let duration = 100;
      let length = 32;
      let numbers = Array.from({ length }).map((_, i) => i);

      let tasks = numbers.map(index =>
        new Task<number, number>(({ Ok, Err }) => {
          running++;
          max = Math.max(max, running);
          setTimeout(() => {
            index % 2 === 0 ? Ok(index) : Err(index);
          }, duration);
        }).finally(() => {
          running--;
        })
      );

      let start = Date.now();
      let [oks, errs] = await Task.collect_concurrent(
        { concurrency },
        tasks
      ).try();
      let time = Date.now() - start;

      expect(oks.length).toEqual(length / 2);
      expect(errs.length).toEqual(length / 2);
      expect(running).toBe(0);
      expect(max).toBe(concurrency);
      expect(time).toBeGreaterThanOrEqual((length / concurrency) * duration);
      expect(time).toBeLessThanOrEqual(
        (length / concurrency) * duration + duration
      );
    });

    it("should resolve with an empty array", async () => {
      let task = Task.collect_concurrent({ concurrency: 12 }, []);
      expect(await task.try()).toEqual([[], []]);
    });
  });
});
