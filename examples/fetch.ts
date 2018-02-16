import axios, { AxiosResponse, AxiosError } from "axios";
import { Result, Ok, Err } from "../src";

main();

async function get<T>(
  path: string
): Promise<Result<AxiosResponse<T>, AxiosError>> {
  return axios
    .get(`https://api.github.com${path}`)
    .then(Ok)
    .catch(Err);
}

namespace Github {
  export interface User {
    id: number;
  }

  export interface Repo {
    name: string;
  }
}

/**
 * Perform a complex chain of dependent actions.
 *
 * 1. Query the user for existence
 * 2. Query the user's repos if the exist
 * 3. Query a specific repo if the repos call succeeded
 * 4. Log the success or failure of the sequence
 */
async function main() {
  let repo_result = await get<Github.User>("/users/alexsasharegan")
    .then(result =>
      result.and_await(get<Github.Repo[]>("/users/alexsasharegan/repos"))
    )
    .then(result => result.and_await(get("/repos/alexsasharegan/safe-types")));

  repo_result
    .map_both(res => res.data, err => err.message)
    .map_both(console.log, console.error);
}
