import { Err, None, Ok, Result, Some, Task } from "./index";

describe("Result.Ok", () => {
  it("should return Result of Ok", () => {
    let r = Ok("Things are good");
    expect(r).toBeInstanceOf(Result);
    expect(r.is_ok()).toBe(true);
    expect(r.is_err()).toBe(false);
  });
});

describe("Result.Err", () => {
  it("should return Result of Err", () => {
    let r = Err("Things are bad");
    expect(r).toBeInstanceOf(Result);
    expect(r.is_ok()).toBe(false);
    expect(r.is_err()).toBe(true);
  });
});

describe("Result.is_ok && Result.is_err", () => {
  it("with Ok", () => {
    let res = Ok(10);
    expect(res.is_ok()).toBe(true);
    expect(res.is_err()).toBe(false);
  });

  it("with Err", () => {
    let res = Err(10);
    expect(res.is_err()).toBe(true);
    expect(res.is_ok()).toBe(false);
  });
});

describe("Result.match", () => {
  it("should go 💥 with never", () => {
    let res = new Result(<any>{});
    expect(res.is_ok.bind(res)).toThrowErrorMatchingSnapshot();
  });
});

describe("Result.ok", () => {
  it("should equal Some with Ok", () => {
    expect(Ok(2).ok()).toEqual(Some(2));
  });

  it("should equal None with Err", () => {
    expect(Err("Nothing here").ok()).toEqual(None());
  });
});

describe("Result.err", () => {
  it("should equal None with Ok", () => {
    expect(Ok(2).err()).toEqual(None());
  });

  it("should equal Some with Err", () => {
    expect(Err("Nothing here").err()).toEqual(Some("Nothing here"));
  });
});

describe("Result.task", () => {
  it("should yield Ok when Ok", async () => {
    let task = Ok(2).task();
    expect(task).toBeInstanceOf(Task);
    expect(await task.run()).toEqual(Ok(2));
  });
  it("should yield Err when Err", async () => {
    let task = Err(2).task();
    expect(task).toBeInstanceOf(Task);
    expect(await task.run()).toEqual(Err(2));
  });
});

describe("Result.tap", () => {
  it("should tap when Ok", () => {
    let tapped = jest.fn();
    let instance = Ok(42);
    instance.tap(tapped);
    expect(tapped).toHaveBeenCalledWith(42);
    expect(instance).toEqual(Ok(42));
    expect(instance).toBe(instance);
  });

  it("should not tap when Err", () => {
    let untapped = jest.fn();
    let instance = Err(42);
    instance.tap(untapped);
    expect(untapped).not.toHaveBeenCalled();
    expect(instance).toEqual(Err(42));
    expect(instance).toBe(instance);
  });
});

describe("Result.tap_err", () => {
  it("should tap when Err", () => {
    let tapped = jest.fn();
    let instance = Err(42);
    instance.tap_err(tapped);
    expect(tapped).toHaveBeenCalledWith(42);
    expect(instance).toEqual(Err(42));
    expect(instance).toBe(instance);
  });

  it("should not tap when Ok", () => {
    let untapped = jest.fn();
    let instance = Ok(42);
    instance.tap_err(untapped);
    expect(untapped).not.toHaveBeenCalled();
    expect(instance).toEqual(Ok(42));
    expect(instance).toBe(instance);
  });
});

describe("Result.map", () => {
  it("should transform with Ok", () => {
    let x = Ok(4);
    expect(x.map(x => x * x)).toEqual(Ok(16));
  });

  it("should not transform with Err", () => {
    let x = Err(4);
    expect(x.map(x => x * x)).toEqual(Err(4));
  });
});

describe("Result.map_err", () => {
  it("should not transform with Ok", () => {
    let x = Ok(2);
    expect(x.map_err(num => Object.prototype.toString.call(num))).toEqual(
      Ok(2)
    );
  });

  it("should transform with Err", () => {
    let x = Err(13);
    expect(x.map_err(x => x.toString())).toEqual(Err("13"));
    expect(x.map_err(x => x.toString())).not.toEqual(Err(13));
  });
});

describe("Result.map_both", () => {
  let sq = (x: number) => x * x;
  it("should transform with Ok", () => {
    let x = Ok(4);
    expect(x.map_both(sq, sq)).toEqual(Ok(16));
  });

  it("should not transform with Err", () => {
    let x = Err(4);
    expect(x.map_both(sq, sq)).toEqual(Err(16));
  });
});

describe("Result.and", () => {
  it("with Ok && Err", () => {
    let x = Ok(2);
    let y = Err("late error");
    expect(x.and(y)).toEqual(Err("late error"));
  });

  it("with Err && Ok", () => {
    let x = Err("early error");
    let y = Ok("foo");
    expect(x.and(y)).toEqual(Err("early error"));
  });

  it("with Err && Err", () => {
    let x = Err("not a 2");
    let y = Err("late error");
    expect(x.and(y)).toEqual(Err("not a 2"));
  });

  it("with Ok && Ok", () => {
    let x = Ok(2);
    let y = Ok("different result type");
    expect(x.and(y)).toEqual(Ok("different result type"));
  });
});

describe("Result.and_await", () => {
  it("with Ok && Err", async () => {
    let x = Ok(2);
    let y = Promise.resolve(Err("late error"));
    expect(await x.and_await(y)).toEqual(Err("late error"));
  });

  it("with Err && Ok", async () => {
    let x = Err("early error");
    let y = Promise.resolve(Ok("foo"));
    expect(await x.and_await(y)).toEqual(Err("early error"));
  });

  it("with Err && Err", async () => {
    let x = Err("not a 2");
    let y = Promise.resolve(Err("late error"));
    expect(await x.and_await(y)).toEqual(Err("not a 2"));
  });

  it("with Ok && Ok", async () => {
    let x = Ok(2);
    let y = Promise.resolve(Ok("different result type"));
    expect(await x.and_await(y)).toEqual(Ok("different result type"));
  });
});

describe("Result.and_then", () => {
  it("should work", () => {
    type NumResultFn = (x: number) => Result<number, number>;
    let sq: NumResultFn = x => Ok(x * x);
    let err: NumResultFn = x => Err(x);

    expect(
      Ok(2)
        .and_then(sq)
        .and_then(sq)
    ).toEqual(Ok(16));

    expect(
      Ok(2)
        .and_then(sq)
        .and_then(err)
    ).toEqual(Err(4));

    expect(
      Ok(2)
        .and_then(err)
        .and_then(sq)
    ).toEqual(Err(2));

    expect(
      Err(3)
        .and_then(sq)
        .and_then(sq)
    ).toEqual(Err(3));
  });
});

describe("Result.and_then_await", () => {
  it("should work", async () => {
    type NumResultFn = (x: number) => Promise<Result<number, number>>;
    let sq: NumResultFn = x => Promise.resolve(Ok(x * x));
    let err: NumResultFn = x => Promise.resolve(Err(x));

    expect(
      await Ok(2)
        .and_then_await(sq)
        .then(r => r.and_then_await(sq))
    ).toEqual(Ok(16));

    expect(
      await Ok(2)
        .and_then_await(sq)
        .then(r => r.and_then_await(err))
    ).toEqual(Err(4));

    expect(
      await Ok(2)
        .and_then_await(err)
        .then(r => r.and_then_await(sq))
    ).toEqual(Err(2));

    expect(
      await Err(3)
        .and_then_await(sq)
        .then(r => r.and_then_await(sq))
    ).toEqual(Err(3));
  });
});

describe("Result.or", () => {
  it("with Ok || Err", () => {
    let x = Ok(2);
    let y = Err("late error");
    expect(x.or(y)).toEqual(Ok(2));
  });

  it("with Err || Ok", () => {
    let x = Err("early error");
    let y = Ok(2);
    expect(x.or(y)).toEqual(Ok(2));
  });

  it("with Err || Err", () => {
    let x = Err("not a 2");
    let y = Err("late error");
    expect(x.or(y)).toEqual(Err("late error"));
  });

  it("with Ok || Ok", () => {
    let x = Ok(2);
    let y = Ok(100);
    expect(x.or(y)).toEqual(Ok(2));
  });
});

describe("Result.or_await", () => {
  const p = <T>(x: T) => Promise.resolve(x);

  it("with Ok || Err", async () => {
    let x = Ok(2);
    let y = Err("late error");
    expect(await x.or_await(p(y))).toEqual(Ok(2));
  });

  it("with Err || Ok", async () => {
    let x = Err("early error");
    let y = Ok(2);
    expect(await x.or_await(p(y))).toEqual(Ok(2));
  });

  it("with Err || Err", async () => {
    let x = Err("not a 2");
    let y = Err("late error");
    expect(await x.or_await(p(y))).toEqual(Err("late error"));
  });

  it("with Ok || Ok", async () => {
    let x = Ok(2);
    let y = Ok(100);
    expect(await x.or_await(p(y))).toEqual(Ok(2));
  });
});

describe("Result.or_else", () => {
  it("should work", () => {
    let sq = (x: number) => Ok(x * x);
    let err = (x: number) => Err(x);

    expect(
      Ok(2)
        .or_else(sq)
        .or_else(sq)
    ).toEqual(Ok(2));

    expect(
      Ok(2)
        .or_else(err)
        .or_else(sq)
    ).toEqual(Ok(2));

    expect(
      Err(3)
        .or_else(sq)
        .or_else(err)
    ).toEqual(Ok(9));

    expect(
      Err(3)
        .or_else(err)
        .or_else(err)
    ).toEqual(Err(3));
  });
});

describe("Result.or_else_await", () => {
  it("should work", async () => {
    let sq = async (x: number) => Ok(x * x);
    let err = async (x: number) => Err(x);

    expect(
      await Ok(2)
        .or_else_await(sq)
        .then(r => r.or_else_await(sq))
    ).toEqual(Ok(2));

    expect(
      await Ok(2)
        .or_else_await(err)
        .then(r => r.or_else_await(sq))
    ).toEqual(Ok(2));

    expect(
      await Err(3)
        .or_else_await(sq)
        .then(r => r.or_else_await(err))
    ).toEqual(Ok(9));

    expect(
      await Err(3)
        .or_else_await(err)
        .then(r => r.or_else_await(err))
    ).toEqual(Err(3));
  });
});

describe("Result.unwrap_or", () => {
  it("with Ok", () => {
    let optb = 2;
    let x: Result<number, string> = Ok(9);
    expect(x.unwrap_or(optb)).toEqual(9);
  });

  it("with Err", () => {
    let optb = 2;
    let x: Result<number, string> = Err("error");
    expect(x.unwrap_or(optb)).toEqual(optb);
  });
});

describe("Result.unwrap_or_else", () => {
  it("should work", () => {
    let count = (x: string) => x.length;

    expect(Ok(2).unwrap_or_else(count)).toEqual(2);
    expect(Err("foo").unwrap_or_else(count)).toEqual(3);
  });
});

describe("Result.unwrap", () => {
  it("should not throw with Ok", () => {
    expect(Ok(2).unwrap()).toBe(2);
  });

  it("should throw with Err", () => {
    expect(() => Err("error").unwrap()).toThrow(Error);
  });
});

describe("Result.expect", () => {
  it("should not throw with Ok", () => {
    expect(Ok(2).expect("my error")).toBe(2);
  });

  it("should throw with Err", () => {
    expect(() => Err("error").expect("my error")).toThrow("my error");
  });
});

describe("Result.try", () => {
  it("should not throw with Ok", () => {
    expect(Ok(2).try()).toBe(2);
  });

  it("should throw the raw Err value when Err", () => {
    let values: any[] = [
      "an error string",
      "",
      true,
      false,
      0,
      -1,
      [],
      {},
      new Date(),
      null,
      undefined,
      new Error("an error"),
      Promise.resolve(true),
      Promise.reject(true),
    ];

    for (let value of values) {
      try {
        Err(value).try();
      } catch (error) {
        expect(error).toBe(value);
      }
    }
  });
});

describe("Result.unwrap_err", () => {
  it("should throw with Ok", () => {
    expect(() => Ok(2).unwrap_err()).toThrow(Error);
  });

  it("should not throw with Err", () => {
    expect(Err("error").unwrap_err()).toBe("error");
  });
});

describe("Result.expect_err", () => {
  it("should throw with Ok", () => {
    expect(() => Ok(2).expect_err("my error")).toThrow("my error");
  });

  it("should not throw with Err", () => {
    expect(Err("error").expect_err("my error")).toBe("error");
  });
});

describe("Result.invert", () => {
  it("should invert types", () => {
    expect(Ok(2).invert()).toEqual(Err(2));
    expect(Err(2).invert()).toEqual(Ok(2));
  });
});

describe("Result.from", () => {
  it("with Ok", () => {
    let op = () => 10;
    expect(Result.from(op)).toEqual(Ok(10));
  });

  it("with Err", () => {
    let op = () => {
      throw 10;
    };
    expect(Result.from(op)).toEqual(Err(10));
    op = () => {
      throw new Error();
    };
    expect(Result.from(op)).toEqual(Err(new Error()));
  });
});

describe("Result.of", () => {
  it("should work like Result.from", () => {
    let op = () => 10;
    expect(Result.of(op)).toEqual(Ok(10));
    let err = () => {
      throw 10;
    };
    expect(Result.of(err)).toEqual(Err(10));
  });
});

describe("Result.every", () => {
  let length = 10;
  it("should return Ok Result with all Ok<T>", () => {
    let results = Array.from({ length }, (_, i) => Ok(i));
    let values = Array.from({ length }, (_, i) => i);
    expect(Result.every(results)).toEqual(Ok(values));
  });

  it("should return Err Result with even 1 Err<E>", () => {
    // Use literal zero to ensure early return
    let results: Result<number, number>[] = Array.from({ length }, (_, i) =>
      i == 0 ? Err(i) : Ok(i)
    );
    expect(Result.every(results)).toEqual(Err(0));
  });
});

describe("Result.some", () => {
  let length = 10;
  it("should return Ok with even 1 Ok<T>", () => {
    // use last index to ensure full array traversal
    let results: Result<number, number>[] = Array.from({ length }, (_, i) =>
      i < length - 1 ? Err(i) : Ok(i)
    );
    expect(Result.some(results)).toEqual(Ok([9]));
  });

  it("should return Ok with an empty list", () => {
    let results: Result<number, number>[] = [];
    expect(Result.some(results)).toEqual(Ok([]));
  });

  it("should return Err<E[]> with all Err<E>", () => {
    let results = Array.from({ length }, (_, i) => Err(i));
    let values = Array.from({ length }, (_, i) => i);
    expect(Result.some(results)).toEqual(Err(values));
  });
});

describe("Result.await", () => {
  it("should work with Ok", async () => {
    let fn = async () => 10;
    expect(await Result.await(fn())).toEqual(Ok(10));
  });

  it("should work with Err", async () => {
    let fn = async () => {
      throw 10;
    };
    expect(await Result.await(fn())).toEqual(Err(10));
  });
});

describe("Result.await_fn", () => {
  it("should work with Ok", async () => {
    let fn = async () => 10;
    expect(await Result.await_fn(fn)).toEqual(Ok(10));
  });

  it("should work with Err", async () => {
    let fn = () => {
      throw 10;
    };
    expect(await Result.await_fn(fn)).toEqual(Err(10));
  });
});

describe("Result.await_all", () => {
  it("should work with Ok", async () => {
    let fn = async () => 10;
    expect(await Result.await_all(Array.from({ length: 3 }, fn))).toEqual(
      Ok([10, 10, 10])
    );
  });

  it("should work with Err", async () => {
    let fn = async () => {
      throw 10;
    };
    expect(await Result.await_all(Array.from({ length: 3 }, fn))).toEqual(
      Err(10)
    );
  });
});

describe("Result.await_all_fn", () => {
  it("should work with Ok", async () => {
    let fn = async () => 10;
    expect(
      await Result.await_all_fn(() => Array.from({ length: 3 }, fn))
    ).toEqual(Ok([10, 10, 10]));
  });

  it("should work with Err", async () => {
    let fn = () => {
      throw 10;
    };
    expect(
      await Result.await_all_fn(() => Array.from({ length: 3 }, fn))
    ).toEqual(Err(10));
  });
});

describe("Result.toString", () => {
  it("with Ok", () => {
    expect(Ok("success").toString()).toMatchSnapshot();
  });

  it("with Err", () => {
    expect(Err("error").toString()).toMatchSnapshot();
  });
});
