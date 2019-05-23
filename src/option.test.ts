import { Err, Mapper, None, Ok, Option, Some } from "./index";

describe("Some", () => {
  it("should return Option of Some", () => {
    let o = Some(0);
    expect(o).toBeInstanceOf(Option);
    expect(o.is_none()).toBe(false);
    expect(o.is_some()).toBe(true);
  });
});

describe("None", () => {
  it("should return Option of None", () => {
    let o = None();
    expect(o).toBeInstanceOf(Option);
    expect(o.is_none()).toBe(true);
    expect(o.is_some()).toBe(false);
  });
});

describe("Option.from && Option.of", () => {
  it("should be None when given undefined or null value", () => {
    let x: number | null | undefined = undefined;
    let o = Option.from<number>(x);
    expect(o.is_none()).toBe(true);
    expect(o.is_some()).toBe(false);

    x = null;
    o = Option.of<number>(x);
    expect(o.is_none()).toBe(true);
    expect(o.is_some()).toBe(false);
  });

  it("should be Some when given a value", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.is_none()).toBe(false);
    expect(o.is_some()).toBe(true);

    o = Option.of(x);
    expect(o.is_none()).toBe(false);
    expect(o.is_some()).toBe(true);
  });
});

describe("Option.expect", () => {
  it("should return value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    let err_msg = "You blew it up. 💥";
    expect(o.expect(err_msg)).toBe(10);
  });

  it("should throw custom Error with message with None", () => {
    let x: number | undefined = undefined;
    let o = Option.from(x);
    let err_msg = "You blew it up. 💥";
    expect(() => o.expect(err_msg)).toThrow(err_msg);
  });
});

describe("Option.unwrap", () => {
  it("should return value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.unwrap()).toBe(10);
  });

  it("should throw Error with None", () => {
    let x: number | null = null;
    let o = Option.from(x);
    expect(o.unwrap).toThrow(Error);

    let err;
    try {
      o.unwrap();
    } catch (e) {
      err = e;
    }

    expect(err).toMatchSnapshot();
  });
});

describe("Option.unwrap_or", () => {
  it("should return value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.unwrap_or(20)).toBe(10);
  });

  it("should return default with None", () => {
    let x: number | null = null;
    let o = Option.from<number>(x);
    expect(o.unwrap_or(20)).toBe(20);
  });
});

describe("Option.unwrap_or_else", () => {
  it("should return value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.unwrap_or_else(() => 20)).toBe(10);
  });

  it("should return default with None", () => {
    let o = Option.from<number>(null);
    expect(o.unwrap_or_else(() => 20)).toBe(20);
  });
});

describe("Option.tap", () => {
  it("should tap the value when Some", () => {
    let tapped = jest.fn();
    let instance = Option.Some(42);
    instance.tap(tapped);
    expect(tapped).toHaveBeenCalledWith(42);
    expect(instance).toEqual(Option.Some(42));
    expect(instance).toBe(instance);
  });

  it("should not tap the value when None", () => {
    let untapped = jest.fn();
    let instance = Option.None();
    instance.tap(untapped);
    expect(untapped).not.toHaveBeenCalled();
    expect(instance).toEqual(Option.None());
    expect(instance).toBe(instance);
  });
});

describe("Option.map", () => {
  it("should map value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.map(x => x.toString(16)).unwrap()).toBe("a");
  });

  it("should not call mapper with None", () => {
    let o = Option.from<number>(null);
    let map_spy: Mapper<number, string> = jest.fn(x => x.toString(16));
    let opt_str = o.map(map_spy);
    // because our type is None, shouldn't call the mapper
    expect(map_spy).not.toHaveBeenCalled();
    // ensure a fresh option created
    expect(opt_str).not.toBe(o);
    expect(opt_str.is_none()).toBe(true);
  });
});

describe("Option.map_or", () => {
  it("should use mapped value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.map_or("z", x => x.toString(16))).toBe("a");
  });

  it("should return default value with None", () => {
    let o = Option.from<number>(null);
    let map_spy: Mapper<number, string> = jest.fn(x => x.toString(16));
    expect(o.map_or("z", map_spy)).toBe("z");
    expect(map_spy).not.toHaveBeenCalled();
  });
});

describe("Option.map_or_else", () => {
  it("should use mapped value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.map_or_else(() => "z", x => x.toString(16))).toBe("a");
  });

  it("should return default value with None", () => {
    let o = Option.from<number>(undefined);
    let map_spy: Mapper<number, string> = jest.fn(x => x.toString(16));
    expect(o.map_or_else(() => "z", map_spy)).toBe("z");
    expect(map_spy).not.toHaveBeenCalled();
  });
});

describe("Option.match", () => {
  it("should use mapped value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    let none_match = jest.fn(() => "testing");
    let some_match = jest.fn(num => num.toString(16));
    expect(
      o.match({
        None: none_match,
        Some: some_match,
      })
    ).toBe("a");
    expect(none_match).not.toHaveBeenCalled();
    expect(some_match).toHaveBeenCalled();
  });

  it("should return default value with None", () => {
    let o = Option.from<number>(undefined);
    let none_match = jest.fn(() => "testing");
    let some_match = jest.fn(num => num.toString(16));
    expect(
      o.match({
        None: none_match,
        Some: some_match,
      })
    ).toBe("testing");
    expect(none_match).toHaveBeenCalled();
    expect(some_match).not.toHaveBeenCalled();
  });

  it("should go 💥  with never", () => {
    let opt = new Option(<any>{});
    expect(opt.is_some.bind(opt)).toThrowErrorMatchingSnapshot();
  });
});

describe("Option.ok_or", () => {
  it("with Some", () => {
    let x = Some("foo");
    expect(x.ok_or(0)).toEqual(Ok("foo"));
  });

  it("with None", () => {
    let x: Option<string> = None();
    expect(x.ok_or(0)).toEqual(Err(0));
  });
});

describe("Option.ok_or_else", () => {
  it("with Some", () => {
    let x = Some("foo");
    expect(x.ok_or_else(() => 0)).toEqual(Ok("foo"));
  });

  it("with None", () => {
    let x: Option<string> = None();
    expect(x.ok_or_else(() => 0)).toEqual(Err(0));
  });
});

describe("Option.and", () => {
  it("Some && None", () => {
    let x = Some(2);
    let y: Option<string> = None();
    expect(x.and(y)).toEqual(None());
  });
  it("None && Some", () => {
    let x: Option<number> = None();
    let y = Some("foo");
    expect(x.and(y)).toEqual(None());
  });
  it("Some && Some", () => {
    let x = Some(2);
    let y = Some("foo");
    expect(x.and(y)).toEqual(Some("foo"));
  });
  it("None && None", () => {
    let x: Option<number> = None();
    let y: Option<string> = None();
    expect(x.and(y)).toEqual(None());
  });
});

describe("Option.and_await", () => {
  it("None && None", async () => {
    let a: Option<number> = None();
    let b: Promise<Option<number>> = Promise.resolve(None());
    expect(await a.and_await(b)).toEqual(None());
  });
  it("None && Some", async () => {
    let a: Option<number> = None();
    let b = Promise.resolve(Some(1));
    expect(await a.and_await(b)).toEqual(None());
  });
  it("Some && None", async () => {
    let a = Some(1);
    let b: Promise<Option<number>> = Promise.resolve(None());
    expect(await a.and_await(b)).toEqual(None());
  });
  it("Some && Some", async () => {
    let a: Option<number> = Some(0);
    let b = Promise.resolve(Some(1));
    expect(await a.and_await(b)).toEqual(Some(1));
  });
});

describe("Option.and_then", () => {
  it("should work", () => {
    let sq = (x: number) => Some(x * x);
    let nope = (_: number) => None();

    expect(
      Some(2)
        .and_then(sq)
        .and_then(sq)
    ).toEqual(Some(16));

    expect(
      Some(2)
        .and_then(sq)
        .and_then(nope)
    ).toEqual(None());

    expect(
      Some(2)
        .and_then(nope)
        .and_then(sq)
    ).toEqual(None());

    expect(
      None()
        .and_then(sq)
        .and_then(sq)
    ).toEqual(None());
  });
});

describe("Option.and_then_await", () => {
  const async_inc = (n: number) => Promise.resolve(Some(n + 1));
  const async_nope = () => Promise.resolve(None());

  it("None && None", async () => {
    let a: Option<number> = None();
    expect(await a.and_then_await(async_nope)).toEqual(None());
  });
  it("None && Some", async () => {
    let a: Option<number> = None();
    expect(await a.and_then_await(async_inc)).toEqual(None());
  });
  it("Some && None", async () => {
    let a = Some(1);
    expect(await a.and_then_await(async_nope)).toEqual(None());
  });
  it("Some && Some", async () => {
    let a: Option<number> = Some(1);
    expect(await a.and_then_await(async_inc)).toEqual(Some(2));
  });
});

describe("Option.filter", () => {
  it("should work", () => {
    let is_even: (n: number) => boolean = n => n % 2 == 0;

    expect(None().filter(is_even)).toEqual(None());
    expect(Some(3).filter(is_even)).toEqual(None());
    expect(Some(4).filter(is_even)).toEqual(Some(4));
  });
});

describe("Option.narrow", () => {
  it("should work", () => {
    let chaos = (n: number) => {
      switch (n) {
        case 0:
          return "test string";
        case 1:
          return 1;
        default:
          return true;
      }
    };

    function notString<T>(x: T): x is Exclude<T, string> {
      return typeof x != "string";
    }

    function notNumber<T>(x: T): x is Exclude<T, number> {
      return typeof x != "number";
    }

    function notBool<T>(x: T): x is Exclude<T, boolean> {
      return typeof x != "boolean";
    }

    expect(None().narrow(notString)).toEqual(None());

    expect(Some(chaos(0)).narrow(notString)).toEqual(None());
    expect(Some(chaos(1)).narrow(notNumber)).toEqual(None());
    expect(Some(chaos(2)).narrow(notBool)).toEqual(None());

    expect(
      Some(chaos(0))
        .narrow(notNumber)
        .narrow(notBool)
    ).toEqual(Some("test string"));

    expect(
      Some(chaos(1))
        .narrow(notString)
        .narrow(notBool)
    ).toEqual(Some(1));

    expect(
      Some(chaos(2))
        .narrow(notString)
        .narrow(notNumber)
    ).toEqual(Some(true));
  });
});

describe("Option.or", () => {
  it("Some || None", () => {
    let x = Some(2);
    let y = None();
    expect(x.or(y)).toEqual(Some(2));
  });

  it("None || Some", () => {
    let x = None();
    let y = Some(100);
    expect(x.or(y)).toEqual(Some(100));
  });

  it("Some || Some", () => {
    let x = Some(2);
    let y = Some(100);
    expect(x.or(y)).toEqual(Some(2));
  });

  it("None || None", () => {
    let x: Option<number> = None();
    let y = None();
    expect(x.or(y)).toEqual(None());
  });
});

describe("Option.or_await", () => {
  const p = <T>(x: T) => Promise.resolve(x);

  it("Some || None", async () => {
    let x = Some(2);
    let y = None();
    expect(await x.or_await(p(y))).toEqual(Some(2));
  });

  it("None || Some", async () => {
    let x = None();
    let y = Some(100);
    expect(await x.or_await(p(y))).toEqual(Some(100));
  });

  it("Some || Some", async () => {
    let x = Some(2);
    let y = Some(100);
    expect(await x.or_await(p(y))).toEqual(Some(2));
  });

  it("None || None", async () => {
    let x: Option<number> = None();
    let y = None();
    expect(await x.or_await(p(y))).toEqual(None());
  });
});

describe("Option.or_else", () => {
  it("should work", () => {
    let nobody = () => None();
    let vikings = () => Some("vikings");

    expect(Some("barbarians").or_else(vikings)).toEqual(Some("barbarians"));
    expect(None().or_else(vikings)).toEqual(Some("vikings"));
    expect(None().or_else(nobody)).toEqual(None());
  });
});

describe("Option.or_else_await", () => {
  it("should work", async () => {
    let nobody = async () => None();
    let vikings = async () => Some("vikings");

    expect(await Some("barbarians").or_else_await(vikings)).toEqual(
      Some("barbarians")
    );
    expect(await None().or_else_await(vikings)).toEqual(Some("vikings"));
    expect(await None().or_else_await(nobody)).toEqual(None());
  });
});

describe("Option.into_result", () => {
  it("should Ok with Some", () => {
    let x = Option.of(2);
    expect(x.into_result().is_ok()).toBe(true);
    expect(x.into_result().is_err()).toBe(false);
    expect(x.into_result()).toEqual(Ok(2));
  });

  it("should Err with None", () => {
    let x = Option.of(null);
    expect(x.into_result().is_err()).toBe(true);
    expect(x.into_result().is_ok()).toBe(false);
    expect(x.into_result()).toEqual(Err(undefined));
  });
});

describe("Option.into_result_err", () => {
  it("should Err with Some", () => {
    let x = Option.of(2);
    expect(x.into_result_err().is_ok()).toBe(false);
    expect(x.into_result_err().is_err()).toBe(true);
    expect(x.into_result_err()).toEqual(Err(2));
  });

  it("should Ok with None", () => {
    let x = Option.of(null);
    expect(x.into_result_err().is_err()).toBe(false);
    expect(x.into_result_err().is_ok()).toBe(true);
    expect(x.into_result_err()).toEqual(Ok(undefined));
  });
});

describe("Option.every", () => {
  let length = 10;
  it("should return Some with all Some<T>", () => {
    let options = Array.from({ length }, (_, i) => Option.of(i));
    let values = Array.from({ length }, (_, i) => i);
    expect(Option.every(options)).toEqual(Some(values));
  });

  it("should return None with any None", () => {
    let options = Array.from({ length }, (_, i) => Option.of(i ? i : null));
    expect(Option.every(options)).toEqual(None());
  });
});

describe("Option.some", () => {
  let length = 10;
  it("should return Some with even 1 Some<T>", () => {
    let options = Array.from({ length }, (_, i) =>
      Option.of(i == 0 ? i : null)
    );
    expect(Option.some(options)).toEqual(Some([0]));
  });

  it("should return Some with empty list", () => {
    expect(Option.some([])).toEqual(Some([]));
  });

  it("should return None with all None", () => {
    let options = Array.from({ length }, () => None());
    expect(Option.some(options)).toEqual(None());
  });
});

describe("Option.toJSON", () => {
  let stringify = (x: any) => JSON.stringify(x, null, "  ");

  it("should serialize None as null", () => {
    let none = None();
    expect(stringify(none)).toMatchSnapshot("toJSON");
    expect(
      stringify({
        x: "foo",
        y: {
          bar: None(),
        },
      })
    ).toMatchSnapshot("toJSON");
  });

  it("should serialize Some as itself", () => {
    let some_things = [
      "string",
      "",
      true,
      false,
      0,
      1,
      {},
      ["something complex", 1, { foo: "bar" }],
    ].map(Some);

    for (let some of some_things) {
      expect(stringify(some)).toMatchSnapshot("toJSON");
    }

    expect(
      stringify({
        array: [1, 2, 3],
        obj: { foo: "bar" },
        num: 123,
        bool: true,
        maybeCopy: Option.of({
          array: [1, 2, 3],
          obj: { foo: "bar" },
          num: 123,
          bool: true,
        }),
      })
    ).toMatchSnapshot("toJSON");
  });
});

describe("Option.toString", () => {
  it("with None", () => {
    expect(None().toString()).toMatchSnapshot("toString");
  });

  it("with Some", () => {
    expect(Some([1, 2, 3]).toString()).toMatchSnapshot("toString");
  });
});
