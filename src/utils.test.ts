import { is_never, is_void } from "./utils";

describe("Utils", () => {
  it("is_never", async () => {
    expect(is_never).toThrow();
  });

  it("is_void", async () => {
    expect(is_void(0)).toBe(false);
    expect(is_void("")).toBe(false);
    expect(is_void([])).toBe(false);
    expect(is_void({})).toBe(false);
    expect(is_void(false)).toBe(false);
    expect(is_void(null)).toBe(true);
    expect(is_void(undefined)).toBe(true);
  });
});
