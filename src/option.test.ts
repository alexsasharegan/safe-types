import { Option, Some, None, Ok, Err } from ".";
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
        none: none_match,
        some: some_match,
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
        none: none_match,
        some: some_match,
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
