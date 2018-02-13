import { ResultVariant } from ".";

export type Err<E> = {
  readonly variant: ResultVariant.Err;
  readonly error: E;
};

export function Err<E>(error: E): Err<E> {
  return {
    error,
    variant: ResultVariant.Err,
  };
}
