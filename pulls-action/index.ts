import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getOctokit } from "../client/octokit";
import getUserConfig from "../client/getUserConfig";
import getTemplates from "../client/getTemplates";
import Template from "../structures/Template";
import * as pulls from "./pulls/pulls";
import * as mergeConflicts from "./pulls/mergeConflicts";
import * as workflow_run from "./workflow_run/workflow_run";

import { OctokitClient } from "../client/octokit";
import { PullsActionUserConfigInterface } from "./interfaces";
import {
  PullRequestEvent,
  PushEvent,
  WorkflowRunEvent,
} from "@octokit/webhooks-types";

export type PullsActionClient = {
  octokit: OctokitClient;
  config: PullsActionUserConfigInterface;
  templates: Map<string, Template>;
};

const run = async (): Promise<void> => {
  try {
    const { owner, repo } = context.issue;

    // Create PullsActionClient object
    const octokit: OctokitClient = getOctokit();

    const [config, templates]: [
      PullsActionUserConfigInterface,
      Map<string, Template>
    ] = await Promise.all([
      getUserConfig(octokit, owner, repo),
      getTemplates(octokit, owner, repo),
    ]);

    const client: PullsActionClient = {
      octokit,
      config,
      templates,
    };

    if (context.eventName === "pull_request") {
      const payload = context.payload as PullRequestEvent;

      pulls.run(client, payload, owner, repo);
    } else if (context.eventName === "push") {
      const payload = context.payload as PushEvent;

      mergeConflicts.run(client, payload, owner, repo);
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
