import { None } from "./none";
import { Some } from "./some";
import { is_void, Mapper } from "./utils";
import { OptionVariant, expect_never } from ".";

export type Nullable<T> = T | undefined | null;

export type OptionType<T> = Some<T> | None;

export class Option<T> {
  constructor(private readonly option: OptionType<T>) {}

  match<U>(matcher: {
    [OptionVariant.None](): U;
    [OptionVariant.Some](val: T): U;
  }): U {
    switch (this.option.variant) {
      case OptionVariant.None:
        return matcher[OptionVariant.None]();

      case OptionVariant.Some:
        return matcher[OptionVariant.Some](this.option.value);

      default:
        return expect_never(this.option, "Invalid Option variant.");
    }
  }

  is_some(): this is Some<T> {
    return this.match({
      some: (_: T) => true,
      none: () => false,
    });
  }

  is_none(): this is None {
    return !this.is_some();
  }

  expect(err_msg: string): T {
    return this.match({
      some: (x: T) => x,
      none: () => {
        throw new Error(err_msg);
      },
    });
  }

  unwrap(): T {
    return this.match({
      some: (x: T) => x,
      none: () => {
        throw new Error("called `Option.unwrap()` on a `None` value");
      },
    });
  }

  unwrap_or(def: T): T {
    return this.match({
      some: (x: T) => x,
      none: () => def,
    });
  }

  unwrap_or_else(fn: () => T): T {
    return this.match({
      some: (x: T) => x,
      none: () => fn(),
    });
  }

  map<U>(fn: Mapper<T, U>): Option<U> {
    return this.match({
      some: (x: T) => Option.Some(fn(x)),
      none: () => Option.None<U>(),
    });
  }

  map_or<U>(def: U, fn: Mapper<T, U>): U {
    return this.match({
      some: (x: T) => fn(x),
      none: () => def,
    });
  }

  map_or_else<U>(def: () => U, fn: Mapper<T, U>): U {
    return this.match({
      some: (x: T) => fn(x),
      none: () => def(),
    });
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
