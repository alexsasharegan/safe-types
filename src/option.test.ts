import { Option } from "./option.class";
import { Mapper } from "./option.core";

describe("Option.from", () => {
  it("should be None when given undefined value", () => {
    let x: number;
    let o = Option.from(x);
    expect(o.is_none()).toBe(true);
    expect(o.is_some()).toBe(false);
  });

  it("should be Some when given a value", () => {
    let x = 10;
    let o = Option.from(x);
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
    let x: number;
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

  it("should throw TypeError with None", () => {
    let x: number;
    let o = Option.from(x);
    expect(o.unwrap).toThrow(TypeError);
  });
});

describe("Option.unwrap_or", () => {
  it("should return value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.unwrap_or(20)).toBe(10);
  });

  it("should return default with None", () => {
    let x: number;
    let o = Option.from(x);
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
    let x: number;
    let o = Option.from(x);
    expect(o.unwrap_or_else(() => 20)).toBe(20);
  });
});

describe("Option.map", () => {
  it("should map value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.map(x => x.toString(16)).unwrap()).toBe("a");
  });

  it("should not call mapper with None", () => {
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

describe("Option.map_or", () => {
  it("should use mapped value with Some", () => {
    let x = 10;
    let o = Option.from(x);
    expect(o.map_or("z", x => x.toString(16))).toBe("a");
  });

  it("should return default value with None", () => {
    let x: number;
    let o = Option.from(x);
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
    let x: number;
    let o = Option.from(x);
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
        none: none_match,
        some: some_match,
      })
    ).toBe("a");
    expect(none_match).not.toHaveBeenCalled();
    expect(some_match).toHaveBeenCalled();
  });

  it("should return default value with None", () => {
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
