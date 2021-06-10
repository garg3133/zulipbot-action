import updateSizeLabel from "./updateSizeLabel";

import { PullsActionClient } from "../index";
import { PullRequestEvent } from "@octokit/webhooks-types";

export const run = async (
  client: PullsActionClient,
  payload: PullRequestEvent,
  owner: string,
  repo: string
): Promise<void> => {
  if (payload.action == "opened" || payload.action == "synchronize") {
    const sizeLabelsConfig = client.config.size_labels;
    if (sizeLabelsConfig && sizeLabelsConfig.labels) {
      updateSizeLabel(client, payload, owner, repo);
    }
  }
};
