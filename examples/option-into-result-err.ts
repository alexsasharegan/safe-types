import * as fs from "fs";
import { Option, Result } from "safe-types";

export async function readFile(
  old_path: fs.PathLike,
  new_path: fs.PathLike
): Promise<Result<void, NodeJS.ErrnoException>> {
  return new Promise<Result<void, NodeJS.ErrnoException>>(resolve =>
    fs.rename(old_path, new_path, err =>
      resolve(Option.of(err).into_result_err())
    )
  );
}
