import { Option } from ".";

export type Mapper<T, U> = (x: T) => U;

export function is_void(val: any): val is null | undefined {
  return val == null;
}

export function is_never(_: never): never {
  throw new Error();
}

export function expect_never(_: never, err_msg: string): never {
  throw new Error(err_msg);
}

export function get_at_path(
  obj: { [key: string]: any },
  path: string[]
): Option<any> {
  return path.reduce(
    (opt: Option<any>, key: string) => opt.and_then(obj => Option.of(obj[key])),
    Option.of(obj)
  );
}

export function has_at_path(
  obj: { [key: string]: any },
  path: string[]
): boolean {
  return get_at_path(obj, path).is_some();
}
