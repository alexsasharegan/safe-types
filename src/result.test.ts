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

describe("Result.or", async () => {
  it("with Ok && Err", async () => {
    let x = Ok(2);
    let y = Err("late error");
    expect(x.or(y)).toEqual(Ok(2));
  });

  it("with Err && Ok", async () => {
    let x = Err("early error");
    let y = Ok(2);
    expect(x.or(y)).toEqual(Ok(2));
  });

  it("with Err && Err", async () => {
    let x = Err("not a 2");
    let y = Err("late error");
    expect(x.or(y)).toEqual(Err("late error"));
  });

  it("with Ok && Ok", async () => {
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
