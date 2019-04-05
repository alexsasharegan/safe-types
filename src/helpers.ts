import { Option, Nullable } from "./option";
import { Result } from "./result";

export function get_at_path(
  obj: Nullable<{ [key: string]: any }>,
  path: string[]
): Option<any> {
  return path.reduce(
    (opt: Option<any>, key: string) => opt.and_then(obj => Option.of(obj[key])),
    Option.of(obj)
  );
}

export function has_at_path(
  obj: Nullable<{ [key: string]: any }>,
  path: string[]
): boolean {
  return get_at_path(obj, path).is_some();
}

export function err_or_ok<E, T>(
  err: E | null | undefined,
  ok: T
): Result<T, E> {
  return Option.of(err).match({
    Some(err) {
      return Result.Err(err);
    },
    None() {
      return Result.Ok(ok);
    },
  });
}
