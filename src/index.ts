import { Option, UnwrapSome } from "./option";

const { Some, None } = Option;

import {
  Result,
  ResultMatcher,
  UnwrapResultErr,
  UnwrapResultOk,
} from "./result";

const { Ok, Err } = Result;

export {
  Task,
  TaskExecutorFunc,
  TaskResolver,
  UnwrapTaskErr,
  UnwrapTaskOk,
  RetryWithBackoffOptions,
} from "./task";

export { OptionVariant, ResultVariant } from "./variant";

export {
  Option,
  Some,
  None,
  UnwrapSome,
  Result,
  Ok,
  Err,
  ResultMatcher,
  UnwrapResultErr,
  UnwrapResultOk,
};

export { is_void, is_never, expect_never, Mapper } from "./utils";
export { get_at_path, has_at_path, err_or_ok } from "./helpers";
