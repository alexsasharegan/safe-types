import { Variant } from ".";

export type None = {
  readonly variant: Variant.None;
  readonly value: null | undefined;
  [key: string]: any;
};

export function None(): None {
  return {
    value: undefined,
    variant: Variant.None,
  };
}
