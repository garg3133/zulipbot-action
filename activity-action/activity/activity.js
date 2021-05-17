import * as utils from "./utils";
import scrapePulls from "./scrapePulls";

export const run = async (client, owner, repo) => {
  // Bring in all open pull requests.
  const pulls = await utils.getAllPages(client, "pulls.list", {
    owner,
    repo,
  });

  await scrapePulls(client, pulls, owner, repo);
};
