import * as r from "rethinkdb";
import { Err, Ok, Option, Result } from "safe-types";

export async function insert_model<T>(
  conn: r.Connection,
  table: string,
  model: T
): Promise<Result<T, string>> {
  return new Promise<Result<T, string>>(resolve =>
    r
      .table(table)
      .insert(model)
      .run(conn, (err, write_result) =>
        resolve(
          Option.of(err)
            .into_result_err()
            .map_err(err => err.message)
            .and_then(
              _ =>
                write_result.errors
                  ? Err(write_result.first_error.message)
                  : Ok(model)
            )
        )
      )
  );
}
