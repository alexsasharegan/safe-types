import { is_never, is_void, expect_never } from "./utils";

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
});
