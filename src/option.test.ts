import { Option, Some, None, Ok, Err, ErrSafeTypes } from ".";
import { Mapper } from "./utils";

describe("Some", async () => {
  it("should return Option of Some", async () => {
    let o = Some(0);
    expect(o).toBeInstanceOf(Option);
    expect(o.is_none()).toBe(false);
    expect(o.is_some()).toBe(true);
  });
});

describe("None", async () => {
  it("should return Option of None", async () => {
    let o = None();
    expect(o).toBeInstanceOf(Option);
    expect(o.is_none()).toBe(true);
    expect(o.is_some()).toBe(false);
  });
});

describe("Option.from && Option.of", async () => {
  it("should be None when given undefined value", async () => {
    let x: number;
    let o = Option.from(x);
    expect(o.is_none()).toBe(true);
    expect(o.is_some()).toBe(false);

    o = Option.of(x);
    expect(o.is_none()).toBe(true);
    expect(o.is_some()).toBe(false);
  });

  it("should be Some when given a value", async () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.is_none()).toBe(false);
    expect(o.is_some()).toBe(true);

    o = Option.of(x);
    expect(o.is_none()).toBe(false);
    expect(o.is_some()).toBe(true);
  });
});

describe("Option.expect", async () => {
  it("should return value with Some", async () => {
    let x = 10;
    let o = Option.from(x);
    let err_msg = "You blew it up. 💥";
    expect(o.expect(err_msg)).toBe(10);
  });

  it("should throw custom Error with message with None", async () => {
    let x: number;
    let o = Option.from(x);
    let err_msg = "You blew it up. 💥";
    expect(() => o.expect(err_msg)).toThrow(err_msg);
  });
});

describe("Option.unwrap", async () => {
  it("should return value with Some", async () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.unwrap()).toBe(10);
  });

  it("should throw Error with None", async () => {
    let x: number;
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

describe("Option.unwrap_or", async () => {
  it("should return value with Some", async () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.unwrap_or(20)).toBe(10);
  });

  it("should return default with None", async () => {
    let x: number;
    let o = Option.from(x);
    expect(o.unwrap_or(20)).toBe(20);
  });
});

describe("Option.unwrap_or_else", async () => {
  it("should return value with Some", async () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.unwrap_or_else(() => 20)).toBe(10);
  });

  it("should return default with None", async () => {
    let x: number;
    let o = Option.from(x);
    expect(o.unwrap_or_else(() => 20)).toBe(20);
  });
});

describe("Option.map", async () => {
  it("should map value with Some", async () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.map(x => x.toString(16)).unwrap()).toBe("a");
  });

  it("should not call mapper with None", async () => {
    let x: number;
    let o = Option.from(x);
    let map_spy: Mapper<number, string> = jest.fn(x => x.toString(16));
    let opt_str = o.map(map_spy);
    // because our type is None, shouldn't call the mapper
    expect(map_spy).not.toHaveBeenCalled();
    // ensure a fresh option created
    expect(opt_str).not.toBe(o);
    expect(opt_str.is_none()).toBe(true);
  });
});

describe("Option.map_or", async () => {
  it("should use mapped value with Some", async () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.map_or("z", x => x.toString(16))).toBe("a");
  });

  it("should return default value with None", async () => {
    let x: number;
    let o = Option.from(x);
    let map_spy: Mapper<number, string> = jest.fn(x => x.toString(16));
    expect(o.map_or("z", map_spy)).toBe("z");
    expect(map_spy).not.toHaveBeenCalled();
  });
});

describe("Option.map_or_else", async () => {
  it("should use mapped value with Some", async () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.map_or_else(() => "z", x => x.toString(16))).toBe("a");
  });

  it("should return default value with None", async () => {
    let x: number;
    let o = Option.from(x);
    let map_spy: Mapper<number, string> = jest.fn(x => x.toString(16));
    expect(o.map_or_else(() => "z", map_spy)).toBe("z");
    expect(map_spy).not.toHaveBeenCalled();
  });
});

describe("Option.match", async () => {
  it("should use mapped value with Some", async () => {
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

  it("should return default value with None", async () => {
    let x: number;
    let o = Option.from(x);
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
});

describe("Option.ok_or", async () => {
  it("with Some", async () => {
    let x = Some("foo");
    expect(x.ok_or(0)).toEqual(Ok("foo"));
  });

  it("with None", async () => {
    let x: Option<string> = None();
    expect(x.ok_or(0)).toEqual(Err(0));
  });
});

describe("Option.ok_or_else", async () => {
  it("with Some", async () => {
    let x = Some("foo");
    expect(x.ok_or_else(() => 0)).toEqual(Ok("foo"));
  });

  it("with None", async () => {
    let x: Option<string> = None();
    expect(x.ok_or_else(() => 0)).toEqual(Err(0));
  });
});

describe("Option.and", async () => {
  it("Some && None", async () => {
    let x = Some(2);
    let y: Option<string> = None();
    expect(x.and(y)).toEqual(None());
  });
  it("None && Some", async () => {
    let x: Option<number> = None();
    let y = Some("foo");
    expect(x.and(y)).toEqual(None());
  });
  it("Some && Some", async () => {
    let x = Some(2);
    let y = Some("foo");
    expect(x.and(y)).toEqual(Some("foo"));
  });
  it("None && None", async () => {
    let x: Option<number> = None();
    let y: Option<string> = None();
    expect(x.and(y)).toEqual(None());
  });
});

describe("Option.and_then", async () => {
  it("should work", async () => {
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

describe("Option.filter", async () => {
  it("should work", async () => {
    let is_even = (n: number) => n % 2 == 0;

    expect(None().filter(is_even)).toEqual(None());
    expect(Some(3).filter(is_even)).toEqual(None());
    expect(Some(4).filter(is_even)).toEqual(Some(4));
  });
});

describe("Option.or", async () => {
  it("Some || None", async () => {
    let x = Some(2);
    let y = None();
    expect(x.or(y)).toEqual(Some(2));
  });

  it("None || Some", async () => {
    let x = None();
    let y = Some(100);
    expect(x.or(y)).toEqual(Some(100));
  });

  it("Some || Some", async () => {
    let x = Some(2);
    let y = Some(100);
    expect(x.or(y)).toEqual(Some(2));
  });

  it("None || None", async () => {
    let x: Option<number> = None();
    let y = None();
    expect(x.or(y)).toEqual(None());
  });
});

describe("Option.or_else", async () => {
  it("should work", async () => {
    let nobody = () => None();
    let vikings = () => Some("vikings");

    expect(Some("barbarians").or_else(vikings)).toEqual(Some("barbarians"));
    expect(None().or_else(vikings)).toEqual(Some("vikings"));
    expect(None().or_else(nobody)).toEqual(None());
  });
});

describe("Option.into_result", () => {
  it("should Ok with Some", async () => {
    let x = Option.of(2);
    expect(x.into_result().is_ok()).toBe(true);
    expect(x.into_result().is_err()).toBe(false);
    expect(x.into_result()).toEqual(Ok(2));
  });

  it("should Err with None", async () => {
    let x = Option.of(null);
    expect(x.into_result().is_err()).toBe(true);
    expect(x.into_result().is_ok()).toBe(false);
    expect(x.into_result()).toEqual(Err(ErrSafeTypes.OptionNone));
  });
});

describe("Option.inverse_result", () => {
  it("should Err with Some", async () => {
    let x = Option.of(2);
    expect(x.inverse_result().is_ok()).toBe(false);
    expect(x.inverse_result().is_err()).toBe(true);
    expect(x.inverse_result()).toEqual(Err(2));
  });

  it("should Ok with None", async () => {
    let x = Option.of(null);
    expect(x.inverse_result().is_err()).toBe(false);
    expect(x.inverse_result().is_ok()).toBe(true);
    expect(x.inverse_result()).toEqual(Ok(undefined));
  });
});

describe("Option use cases", () => {
  function get_nested(
    obj: { [key: string]: any },
    path: string[]
  ): Option<any> {
    return path.reduce(
      (opt: Option<any>, key: string) =>
        opt.and_then(obj => Option.of(obj[key])),
      Option.of(obj)
    );
  }

  function obj_has(obj: { [key: string]: any }, path: string[]): boolean {
    return get_nested(obj, path).is_some();
  }

  it("should safely get nested properties", async () => {
    let obj1 = {
      a: { b: { c: { d: { e: { f: { g: { h: { i: { j: "foo" } } } } } } } } },
    };
    let obj2 = {};
    /* spell-checker: disable */
    let path = "abcdefghij".split("");

    expect(get_nested(obj1, path)).toEqual(Some("foo"));
    expect(get_nested(obj2, path)).toEqual(None());

    expect(obj_has(obj1, path)).toBe(true);
    expect(obj_has(obj2, path)).toBe(false);
  });
});
