import { Variant } from "./variant";

export type Some<T> = {
  readonly variant: Variant.Some;
  readonly value: T;
};

export function Some<T>(value: T): Some<T> {
  return {
    value,
    variant: Variant.Some,
  };
}
