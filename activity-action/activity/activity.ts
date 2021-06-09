import { getAllPages } from "../../utils";
import scrapePulls from "./scrapePulls";

import { ActivityActionClient } from "../types";
import { PullRequest } from "@octokit/webhooks-types";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type PullsListParameters =
  RestEndpointMethodTypes["pulls"]["list"]["parameters"];

export const run = async (
  client: ActivityActionClient,
  owner: string,
  repo: string
): Promise<void> => {
  // Bring in all open pull requests.
  const [api, method] = ["pulls", "list"];
  const parameters: PullsListParameters = {
    owner,
    repo,
  };

  const pulls: PullRequest[] = await getAllPages<
    PullsListParameters,
    PullRequest
  >(client.octokit, api, method, parameters);

  await scrapePulls(client, pulls, owner, repo);
};
