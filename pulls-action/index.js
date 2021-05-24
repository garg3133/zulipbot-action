import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import * as clientConfig from "./clientConfig";
import * as pulls from "./pulls/pulls"
import * as workflow_run from "./workflow_run/workflow_run";

const run = async () => {
  const client = await clientConfig.getClient();

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
  setFailed(error.message);
}
