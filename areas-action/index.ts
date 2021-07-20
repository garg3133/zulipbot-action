import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getOctokit, getOctokitLogin } from "../client/octokit";
import getUserConfig from "../client/getUserConfig";
import addLabelsToLinkedPulls from "./areas/addLabelsToLinkedPulls";
import * as areas from "./areas/areas";

import { OctokitClient } from "../client/octokit";
import { AreasActionUserConfigInterface } from "./interfaces";
import { AreasActionClient } from "./types";
import { IssuesEvent, PullRequestEvent } from "@octokit/webhooks-types";

const run = async (): Promise<void> => {
  try {
    const { owner, repo } = context.issue;

    const octokit: OctokitClient = getOctokit();

    const [username, config]: [string, AreasActionUserConfigInterface] =
      await Promise.all([
        getOctokitLogin(octokit),
        getUserConfig(octokit, owner, repo),
      ]);

    const client: AreasActionClient = {
      octokit: octokit,
      username: username,
      config: config,
    };

    console.log(client.config);

    if (["issues", "pull_request_target"].includes(context.eventName)) {
      const payload = context.payload as IssuesEvent | PullRequestEvent;
      if (payload.action === "labeled" || payload.action === "unlabeled") {
        await areas.run(client, payload, owner, repo);
      }
    }

    if (context.eventName === "pull_request_target") {
      const payload = context.payload as PullRequestEvent;
      if (
        payload.action === "opened" ||
        payload.action === "edited" ||
        payload.action === "synchronize"
      ) {
        await addLabelsToLinkedPulls(client, payload, owner, repo);
      }
    }
  } catch (error) {
    setFailed(error.message);
  }
};

// Run the script
run();
