import { OptionVariant } from ".";

export type Some<T> = {
  readonly variant: OptionVariant.Some;
  readonly value: T;
};

export function Some<T>(value: T): Some<T> {
  return {
    value,
    variant: OptionVariant.Some,
  };
}
