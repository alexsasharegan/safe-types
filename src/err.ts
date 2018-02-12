import { ResultVariant } from "./variant";

export type Err<T> = {
  readonly variant: ResultVariant.Err;
  readonly error: T;
};

export function Err<T>(error: T): Err<T> {
  return {
    error,
    variant: ResultVariant.Err,
  };
}
