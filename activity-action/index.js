import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getClient, getClientLogin } from "../client_config/client";
import getActionConfig from "./activity/getActionConfig";
import getTemplates from "../client_config/getTemplates";
import * as activity from "./activity/activity";

const run = async () => {
  const client = getClient();
  console.log(client);

  // Get bot's username
  client.username = getClientLogin(client);
  console.log("Client username: ", client.username);

  // Get action's config
  client.config = getActionConfig();

  // const context = github.context;
  const { owner, repo } = context.issue;

  // Get templates
  client.templates = getTemplates("activity-action", client, owner, repo);

  const payload = context.payload;
  console.log(payload);

  if (
    context.eventName === "issues" &&
    client.config.issue_assigned_label
  ) {
    if (payload.action === "assigned" || payload.action === "unassigned") {
      // Do something
    }
  } else if (context.eventName === "schedule") {
    activity.run(client, owner, repo);
  }

  // if (payload.action === "labeled" || payload.action === "unlabeled") {
  //   areaLabel.run(client, payload);
  // }
};

// Run the script
try {
  run();
} catch (error) {
  setFailed(error.message);
}
