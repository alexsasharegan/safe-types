import { Option } from "./option";
const Some = Option.Some;
const None = Option.None;

import { Result } from "./result";
const Ok = Result.Ok;
const Err = Result.Err;

export { Option, Some, None, Result, Ok, Err };

export { OptionVariant, ResultVariant } from "./variant";
export { is_void, is_never, expect_never } from "./utils";
