import * as core from "@actions/core";
import * as github from "@actions/github";
import * as config from "./clientConfig";
import * as activity from "./activity/activity";

const run = async () => {
  const client = await config.getClient();

  const context = github.context;
  const payload = context.payload;
  console.log(payload);

  if (
    context.eventName === "issues" &&
    client.config.get(issue_assigned_label)
  ) {
    if (payload.action === "assigned" || payload.action === "unassigned") {
      // Do something
    }
  } else if (context.eventName === "schedule") {
    const { owner, repo } = context.issue;
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
  core.setFailed(error.message);
}
