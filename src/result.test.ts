import { Result, Ok, Err, Some, None } from ".";

describe("Result.Ok", async () => {
  it("should return Result of Ok", async () => {
    let r = Ok("Things are good");
    expect(r).toBeInstanceOf(Result);
    expect(r.is_ok()).toBe(true);
    expect(r.is_err()).toBe(false);
  });
});

describe("Result.Err", async () => {
  it("should return Result of Err", async () => {
    let r = Err("Things are bad");
    expect(r).toBeInstanceOf(Result);
    expect(r.is_ok()).toBe(false);
    expect(r.is_err()).toBe(true);
  });
});

describe("Result.is_ok && Result.is_err", async () => {
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
  it("should go 💥 with never", async () => {
    let res = new Result(<any>{});
    expect(res.is_ok.bind(res)).toThrowErrorMatchingSnapshot();
  });
});

describe("Result.ok", async () => {
  it("should equal Some with Ok", async () => {
    expect(Ok(2).ok()).toEqual(Some(2));
  });

  it("should equal None with Err", async () => {
    expect(Err("Nothing here").ok()).toEqual(None());
  });
});

describe("Result.err", async () => {
  it("should equal None with Ok", async () => {
    expect(Ok(2).err()).toEqual(None());
  });

  it("should equal Some with Err", async () => {
    expect(Err("Nothing here").err()).toEqual(Some("Nothing here"));
  });
});

describe("Result.map", async () => {
  it("should transform with Ok", async () => {
    let x = Ok(4);
    expect(x.map(x => x * x)).toEqual(Ok(16));
  });

  it("should not transform with Err", async () => {
    let x = Err(4);
    expect(x.map(x => x * x)).toEqual(Err(4));
  });
});

describe("Result.map_err", async () => {
  it("should not transform with Ok", async () => {
    let x = Ok(2);
    expect(x.map_err(num => Object.prototype.toString.call(num))).toEqual(
      Ok(2)
    );
  });

  it("should transform with Err", async () => {
    let x = Err(13);
    expect(x.map_err(x => x.toString())).toEqual(Err("13"));
    expect(x.map_err(x => x.toString())).not.toEqual(Err(13));
  });
});

describe("Result.map_both", async () => {
  let sq = x => x * x;
  it("should transform with Ok", async () => {
    let x = Ok(4);
    expect(x.map_both(sq, sq)).toEqual(Ok(16));
  });

  it("should not transform with Err", async () => {
    let x = Err(4);
    expect(x.map_both(sq, sq)).toEqual(Err(16));
  });
});

describe("Result.and", async () => {
  it("with Ok && Err", async () => {
    let x = Ok(2);
    let y = Err("late error");
    expect(x.and(y)).toEqual(Err("late error"));
  });

  it("with Err && Ok", async () => {
    let x = Err("early error");
    let y = Ok("foo");
    expect(x.and(y)).toEqual(Err("early error"));
  });

  it("with Err && Err", async () => {
    let x = Err("not a 2");
    let y = Err("late error");
    expect(x.and(y)).toEqual(Err("not a 2"));
  });

  it("with Ok && Ok", async () => {
    let x = Ok(2);
    let y = Ok("different result type");
    expect(x.and(y)).toEqual(Ok("different result type"));
  });
});

describe("Result.and_await", async () => {
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

describe("Result.and_then", async () => {
  it("should work", async () => {
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

describe("Result.and_then_await", async () => {
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

describe("Result.or", async () => {
  it("with Ok || Err", async () => {
    let x = Ok(2);
    let y = Err("late error");
    expect(x.or(y)).toEqual(Ok(2));
  });

  it("with Err || Ok", async () => {
    let x = Err("early error");
    let y = Ok(2);
    expect(x.or(y)).toEqual(Ok(2));
  });

  it("with Err || Err", async () => {
    let x = Err("not a 2");
    let y = Err("late error");
    expect(x.or(y)).toEqual(Err("late error"));
  });

  it("with Ok || Ok", async () => {
    let x = Ok(2);
    let y = Ok(100);
    expect(x.or(y)).toEqual(Ok(2));
  });
});

describe("Result.or_else", async () => {
  it("should work", async () => {
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

describe("Result.unwrap_or", async () => {
  it("with Ok", async () => {
    let optb = 2;
    let x: Result<number, string> = Ok(9);
    expect(x.unwrap_or(optb)).toEqual(9);
  });

  it("with Err", async () => {
    let optb = 2;
    let x: Result<number, string> = Err("error");
    expect(x.unwrap_or(optb)).toEqual(optb);
  });
});

describe("Result.unwrap_or_else", async () => {
  it("should work", async () => {
    let count = (x: string) => x.length;

    expect(Ok(2).unwrap_or_else(count)).toEqual(2);
    expect(Err("foo").unwrap_or_else(count)).toEqual(3);
  });
});

describe("Result.unwrap", async () => {
  it("should not throw with Ok", async () => {
    expect(Ok(2).unwrap()).toBe(2);
  });

  it("should throw with Err", async () => {
    expect(() => Err("error").unwrap()).toThrow(Error);
  });
});

describe("Result.expect", async () => {
  it("should not throw with Ok", async () => {
    expect(Ok(2).expect("my error")).toBe(2);
  });

  it("should throw with Err", async () => {
    expect(() => Err("error").expect("my error")).toThrow("my error");
  });
});

describe("Result.unwrap_err", async () => {
  it("should throw with Ok", async () => {
    expect(() => Ok(2).unwrap_err()).toThrow(Error);
  });

  it("should not throw with Err", async () => {
    expect(Err("error").unwrap_err()).toBe("error");
  });
});

describe("Result.expect_err", async () => {
  it("should throw with Ok", async () => {
    expect(() => Ok(2).expect_err("my error")).toThrow("my error");
  });

  it("should not throw with Err", async () => {
    expect(Err("error").expect_err("my error")).toBe("error");
  });
});

describe("Result.invert", () => {
  it("should invert types", async () => {
    expect(Ok(2).invert()).toEqual(Err(2));
    expect(Err(2).invert()).toEqual(Ok(2));
  });
});

describe("Result.from", async () => {
  it("with Ok", async () => {
    let op = () => 10;
    expect(Result.from(op)).toEqual(Ok(10));
  });

  it("with Err", async () => {
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

describe("Result.of", async () => {
  it("should work like Result.from", async () => {
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
  it("should return Ok Result with all Ok<T>", async () => {
    let results = Array.from({ length }, (_, i) => Ok(i));
    let values = Array.from({ length }, (_, i) => i);
    expect(Result.every(results)).toEqual(Ok(values));
  });

  it("should return Err Result with even 1 Err<E>", async () => {
    // Use literal zero to ensure early return
    let results: Result<number, number>[] = Array.from(
      { length },
      (_, i) => (i == 0 ? Err(i) : Ok(i))
    );
    expect(Result.every(results)).toEqual(Err(0));
  });
});

describe("Result.some", () => {
  let length = 10;
  it("should return Ok with even 1 Ok<T>", async () => {
    // use last index to ensure full array traversal
    let results: Result<number, number>[] = Array.from(
      { length },
      (_, i) => (i < length - 1 ? Err(i) : Ok(i))
    );
    expect(Result.some(results)).toEqual(Ok([9]));
  });

  it("should return Err<E[]> with all Err<E>", async () => {
    let results = Array.from({ length }, (_, i) => Err(i));
    let values = Array.from({ length }, (_, i) => i);
    expect(Result.some(results)).toEqual(Err(values));
  });
});

describe("Result.await", async () => {
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

describe("Result.await_fn", async () => {
  it("should work with Ok", async () => {
    let fn = async () => 10;
    expect(await Result.await_fn(fn)).toEqual(Ok(10));
  });

  it("should work with Err", async () => {
    let fn = async () => {
      throw 10;
    };
    expect(await Result.await_fn(fn)).toEqual(Err(10));
  });
});

describe("Result.await_all", async () => {
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

describe("Result.await_all_fn", async () => {
  it("should work with Ok", async () => {
    let fn = async () => 10;
    expect(
      await Result.await_all_fn(() => Array.from({ length: 3 }, fn))
    ).toEqual(Ok([10, 10, 10]));
  });

  it("should work with Err", async () => {
    let fn = async () => {
      throw 10;
    };
    expect(
      await Result.await_all_fn(() => Array.from({ length: 3 }, fn))
    ).toEqual(Err(10));
  });
});
