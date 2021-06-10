import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getOctokit } from "../client/octokit";
import getUserConfig from "../client/getUserConfig";
import * as pulls from "./pulls/pulls";
import * as workflow_run from "./workflow_run/workflow_run";

import { OctokitClient } from "../types";
import { PullsActionUserConfigInterface } from "./interfaces";
import { PullRequestEvent, WorkflowRunEvent } from "@octokit/webhooks-types";

export type PullsActionClient = {
  octokit: OctokitClient;
  config: PullsActionUserConfigInterface;
};

const run = async (): Promise<void> => {
  try {
    const { owner, repo } = context.issue;

    const octokit: OctokitClient = getOctokit();

    const config = await getUserConfig(octokit, owner, repo);

    const client: PullsActionClient = {
      octokit,
      config,
    };

    if (context.eventName === "pull_request") {
      const payload = context.payload as PullRequestEvent;

      pulls.run(client, payload, owner, repo);
    } else if (context.eventName === "workflow_run") {
      const payload = context.payload as WorkflowRunEvent;
      if (payload.workflow_run.conclusion !== "success") {
        throw new Error("Pulls action workflow run unsuccessful. Exiting.");
      }

      workflow_run.run(client, payload, owner, repo);
    }
  } catch (error) {
    setFailed(error.message);
  }
};

// Run the script
run();
