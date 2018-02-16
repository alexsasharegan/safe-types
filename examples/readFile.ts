import * as fs from "fs";
import { Option, Result } from "safe-types";

export async function readFile(
  path: fs.PathLike,
  options: { encoding?: null; flag?: string } | string
): Promise<Result<string | Buffer, NodeJS.ErrnoException>> {
  return new Promise<Result<string | Buffer, NodeJS.ErrnoException>>(resolve =>
    fs.readFile(path, options, (err, data) =>
      resolve(
        Option.of(err)
          .into_result_err()
          .map(_ => data)
      )
    )
  );
}
