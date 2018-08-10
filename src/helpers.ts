import { Option } from "./option";

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
