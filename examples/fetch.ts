import axios, { AxiosResponse, AxiosError } from "axios";
import { Result, Ok, Err } from "../src";

process.on("unhandledRejection", err => {
  console.error(err);
  process.exit(1);
});

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

async function main() {
  let user_res = await get<Github.User>("/users/alexsasharegan");
  let repos_res = await user_res.and(
    await get<Github.Repo[]>("/users/alexsasharegan/repos")
  );
  let safe_types_res = await repos_res.and(
    await get("/repos/alexsasharegan/safe-types")
  );

  safe_types_res.err().map(err => console.error(err.message));
  safe_types_res.ok().map(res => console.log(res.data));
}
