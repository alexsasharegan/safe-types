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

    let t = Task.from<typeof value, void>(r => Promise.resolve(r.Err(value)));
    let r = await t.fork({
      Ok: console.error,
      Err,
    });

    expect(Err).toHaveBeenCalledWith(value);
    expect(r).toEqual(Result.Err(value));
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
