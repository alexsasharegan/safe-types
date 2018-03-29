import {
  is_never,
  is_void,
  expect_never,
  get_at_path,
  Some,
  None,
  has_at_path,
} from ".";

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
});
