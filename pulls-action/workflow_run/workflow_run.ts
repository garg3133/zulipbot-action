import { setFailed } from "@actions/core";
import getArtifactData from "./getArtifactData";

import { PullsActionClient } from "../index";
import { WorkflowRunEvent } from "@octokit/webhooks-types";

export const run = async (
  client: PullsActionClient,
  payload: WorkflowRunEvent,
  owner: string,
  repo: string
): Promise<void> => {
  try {
    const artifactData = await getArtifactData(client, payload, owner, repo);
    if (!artifactData) return; // Incase error is thrown.

    if (artifactData.action === "sizeLabel") {
      if (artifactData.remove) {
        await client.octokit.issues.removeLabel({
          owner,
          repo,
          issue_number: artifactData.number,
          name: artifactData.remove,
        });
      }
      if (artifactData.add) {
        await client.octokit.issues.addLabels({
          owner,
          repo,
          issue_number: artifactData.number,
          labels: [artifactData.add],
        });
      }
    }
  } catch (error) {
    setFailed(error.message);
  }
};
