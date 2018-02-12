import { OptionVariant } from "./variant";

export type None = {
  readonly variant: OptionVariant.None;
};

export function None(): None {
  return {
    variant: OptionVariant.None,
  };
}
