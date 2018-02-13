import axios, { AxiosResponse } from "axios";
import { Result, Ok, Err, Option, None } from "../src";

main();

async function get<T, E>(
  url: string,
  params?: { [key: string]: any }
): Promise<Result<AxiosResponse<T>, E>> {
  try {
    return Ok(await axios.get(url, { params }));
  } catch (e) {
    return Err(e);
  }
}

async function main() {
  const github = (path: string) => `https://api.github.com${path}`;
  let user_id;
  let result = await get<any, any>(github("/users/alexsasharegan"))
    .then(async result =>
      result.and_then_await(res => {
        user_id = res.data.id;
        return get<any[], any>(github(`/users/alexsasharegan/repos`));
      })
    )
    .then(async res =>
      res.and_then_await(async res => {
        let repo_exists;

        const paginate = async (res: AxiosResponse<any[]>) => {
          let repo = Option.of(res.data.filter(r => r.name == "safe-types")[0]);
          if (repo.is_some()) {
            repo_exists = true;
            return;
          }

          if (repo.is_none() && res.headers.link) {
            let [, url] = /<([^>]+)>/.exec(res.headers.link);
            return (await get(url)).and_then_await(paginate);
          }
        };

        await paginate(res);

        return Option.of(repo_exists)
          .ok_or("couldn't find `safe-types` repo")
          .and_then_await(repo =>
            get(github(`/repos/alexsasharegan/safe-types`))
          );
      })
    );

  console.log(result.expect("couldn't find repos").data);
}
