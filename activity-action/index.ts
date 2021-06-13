import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getOctokit, getOctokitLogin } from "../client/octokit";
import getActionConfig from "./config/getActionConfig";
import getTemplates from "../client/getTemplates";
import * as activity from "./activity/activity";

import { OctokitClient } from "../client/octokit";
import { ActivityActionClient } from "./types";
import { ActivityActionUserConfigInterface } from "./interfaces";
import Template from "../structures/Template";

const run = async () => {
  try {
    const { owner, repo } = context.issue;

    const octokit: OctokitClient = getOctokit();

    const [username, templates]: [string, Map<string, Template>] =
      await Promise.all([
        getOctokitLogin(octokit),
        getTemplates(octokit, owner, repo),
      ]);

    const config: ActivityActionUserConfigInterface = getActionConfig();

    const client: ActivityActionClient = {
      octokit,
      username,
      templates,
      config,
    };

    if (context.eventName === "schedule") {
      activity.run(client, owner, repo);
    }

    // if (context.eventName === "issues" && client.config.issue_assigned_label) {
    //   if (payload.action === "assigned" || payload.action === "unassigned") {
    //     // Do something
    //   }
    // } else if (context.eventName === "schedule") {
    //   activity.run(client, owner, repo);
    // }

    // if (payload.action === "labeled" || payload.action === "unlabeled") {
    //   areaLabel.run(client, payload);
    // }
  } catch (error) {
    setFailed(error.message);
  }
};

// Run the script
run();
