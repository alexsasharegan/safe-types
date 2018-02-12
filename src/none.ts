import { Variant } from "./variant";

export type None = {
  readonly variant: Variant.None;
};

export function None(): None {
  return {
    variant: Variant.None,
  };
}
