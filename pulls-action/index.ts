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
  config?: PullsActionUserConfigInterface;
};

const run = async (): Promise<void> => {
  try {
    const { owner, repo } = context.issue;

    const client: PullsActionClient = {
      octokit: getOctokit(),
    };

    if (context.eventName === "pull_request") {
      // Get user configuration
      client.config = await getUserConfig(client.octokit, owner, repo);
      const payload = context.payload as PullRequestEvent;

      pulls.run(client, payload, owner, repo);
    } else if (context.eventName === "workflow_run") {
      const payload = context.payload as WorkflowRunEvent;

      workflow_run.run(client, payload, owner, repo);
    }
  } catch (error) {
    setFailed(error.message);
  }
};

// Run the script
run();
