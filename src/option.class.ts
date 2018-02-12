import {
  OptionType,
  OptionInterface,
  is_none,
  is_some,
  unwrap,
  unwrap_or,
  unwrap_or_else,
  map,
  map_or,
  map_or_else,
  match,
  OptionMatcher,
  Nullable,
  expect,
} from "./option.core";
import { None } from "./none";
import { Some } from "./some";
import { is_void, Mapper } from "./utils";

export class Option<T> implements OptionInterface<T> {
  constructor(private readonly option: OptionType<T>) {}

  is_none(): this is None {
    return is_none(this.option);
  }

  is_some(): this is Some<T> {
    return is_some(this.option);
  }

  expect(err_msg: string): T {
    return expect(this.option, err_msg);
  }

  unwrap(): T {
    return unwrap(this.option);
  }

  unwrap_or(def: T): T {
    return unwrap_or(this.option, def);
  }

  unwrap_or_else(fn: () => T): T {
    return unwrap_or_else(this.option, fn);
  }

  map<U>(fn: Mapper<T, U>): Option<U> {
    return new Option(map(this.option, fn));
  }

  map_or<U>(def: U, fn: Mapper<T, U>): U {
    return map_or(this.option, def, fn);
  }

  map_or_else<U>(def: () => U, fn: Mapper<T, U>): U {
    return map_or_else(this.option, def, fn);
  }

  match<U>(matcher: OptionMatcher<T, U>): U {
    return match(this.option, matcher);
  }

  public static from<U>(val: Nullable<U>): Option<U> {
    if (is_void(val)) {
      return Option.None();
    }

    return Option.Some(val);
  }

  public static of<U>(val: Nullable<U>): Option<U> {
    return Option.from(val);
  }

  public static Some<T>(val: T): Option<T> {
    return new Option(Some(val));
  }

  public static None<T>(): Option<T> {
    return new Option(None());
  }
}
