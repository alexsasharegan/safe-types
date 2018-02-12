import { Result, Ok, Err } from ".";

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

describe("Result.is_ok", async () => {
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
