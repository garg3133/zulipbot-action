import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getOctokit, getOctokitLogin } from "../client/octokit";
import getUserConfig from "../client/getUserConfig";
import * as areas from "./areas/areas";
import { OctokitClient } from "../types";
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

    if (
      context.eventName !== "issues" &&
      context.eventName !== "pull_request_target"
    )
      return;

    const payload = context.payload as IssuesEvent | PullRequestEvent;
    console.log(client.config);
    if (payload.action === "labeled" || payload.action === "unlabeled") {
      await areas.run(client, payload, owner, repo);
    }
  } catch (error) {
    setFailed(error.message);
  }
};

// Run the script
run();
