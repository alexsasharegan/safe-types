import {
  Err,
  err_or_ok,
  expect_never,
  get_at_path,
  has_at_path,
  is_never,
  is_void,
  None,
  Ok,
  Result,
  Some,
} from "./index";

describe("Utils", () => {
  it("is_never", async () => {
    expect(is_never).toThrow();
  });

  it("expect_never", async () => {
    let err_msg = "I should never exist";
    expect(() => expect_never(<never>0, err_msg)).toThrow(err_msg);
  });

  it("is_void", async () => {
    expect(is_void(null)).toBe(true);
    expect(is_void(undefined)).toBe(true);

    expect(is_void(0)).toBe(false);
    expect(is_void("")).toBe(false);
    expect(is_void([])).toBe(false);
    expect(is_void({})).toBe(false);
    expect(is_void(false)).toBe(false);
  });

  it("should safely get nested properties", async () => {
    let obj1 = {
      a: { b: { c: { d: { e: { f: { g: { h: { i: { j: "foo" } } } } } } } } },
    };
    let obj2 = {};
    /* spell-checker: disable */
    let path = "abcdefghij".split("");

    expect(get_at_path(obj1, path)).toEqual(Some("foo"));
    expect(get_at_path(obj2, path)).toEqual(None());

    expect(has_at_path(obj1, path)).toBe(true);
    expect(has_at_path(obj2, path)).toBe(false);
  });

  it("should convert err or ok values to results", async () => {
    function nodeStyleSuccess<T>(
      x: T,
      cb: (err: Error | null, value: T) => void
    ) {
      cb(null, x);
    }

    function nodeStyleError<T>(
      _: T,
      cb: (err: Error | null, value: T) => void
    ) {
      // @ts-ignore because
      cb(new Error("Failed"));
    }

    for (let value of [1, "success", true]) {
      let r: Result<typeof value, Error>;
      nodeStyleSuccess(value, (err, ok) => (r = err_or_ok(err, ok)));
      expect(r!).toEqual(Ok(value));
    }

    for (let value of [1, "success", true]) {
      let r: Result<typeof value, Error>;
      nodeStyleError(value, (err, ok) => (r = err_or_ok(err, ok)));
      expect(r!).toEqual(Err(new Error("Failed")));
    }
  });
});
