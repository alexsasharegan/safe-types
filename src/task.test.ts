import { Task, Result } from "./index";

describe("Task", async () => {
  it("should return Task instance", async () => {
    let t = new Task(() => {});
    expect(t).toBeInstanceOf(Task);

    t = Task.from(() => {});
    expect(t).toBeInstanceOf(Task);
  });

  it("Task.fork (success)", async () => {
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

  it("Task.fork (error)", async () => {
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

  it("task.run (success)", async () => {
    const final = "success";
    expect(await Task.from<string, void>(r => r.Ok(final)).run()).toEqual(
      Result.Ok(final)
    );
  });

  it("task.run (error)", async () => {
    const final = "error";
    expect(await Task.from<void, string>(r => r.Err(final)).run()).toEqual(
      Result.Err(final)
    );
  });

  it("task.run_sync (success)", async () => {
    const final = "success";
    expect(Task.from<string, void>(r => r.Ok(final)).run_sync()).toEqual(
      Result.Ok(final)
    );
  });

  it("task.run_sync (error)", async () => {
    const final = "error";
    expect(Task.from<void, string>(r => r.Err(final)).run_sync()).toEqual(
      Result.Err(final)
    );
  });

  it("task.run_sync (no sync callback Error)", async () => {
    let task_bomb = Task.from<string, void>(async r => {
      await new Promise(r => setTimeout(r, 10));
      r.Ok("#boom");
    });

    const fn = () => {
      task_bomb.run_sync();
    };

    expect(fn).toThrowErrorMatchingSnapshot();
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
});
