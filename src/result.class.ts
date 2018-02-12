import { ResultType } from "./result.core";

export class Result<T, E> {
  constructor(public readonly result: ResultType<T, E>) {}
}
