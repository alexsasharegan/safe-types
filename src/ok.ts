import { ResultVariant } from "./variant";

export type Ok<T> = {
  readonly variant: ResultVariant.Ok;
  readonly value: T;
};

export function Ok<T>(value: T): Ok<T> {
  return {
    value,
    variant: ResultVariant.Ok,
  };
}
