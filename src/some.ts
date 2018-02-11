import { Variant } from ".";

export type Some<T> = {
  readonly variant: Variant.Some;
  readonly value: T;
  [key: string]: any;
};

export function Some<T>(value: T): Some<T> {
  return {
    value,
    variant: Variant.Some,
  };
}

// export class Some<T> {
//   public variant = Variant.Some;
//   constructor(public value: T) {}
// }
