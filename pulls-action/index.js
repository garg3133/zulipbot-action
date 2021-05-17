import * as core from "@actions/core";
import * as github from "@actions/github";
import * as clientConfig from "./clientConfig";
import * as pulls from "./pulls/index"
import * as workflow_run from "./workflow_run/index";

const run = async () => {
  const client = await clientConfig.getClient();

  const context = github.context;
  const payload = context.payload;

  const { owner, repo } = context.issue;

  if (context.eventName === "pull_request") {
    // Get action's configuration
    client.config = await clientConfig.getActionConfig(client, owner, repo);

    pulls.run(client, payload);
  } else if (context.eventName === "workflow_run") {
    workflow_run.run(client, payload, owner, repo);
  }

};

// Run the script
try {
  run();
} catch (error) {
  core.setFailed(error.message);
}
