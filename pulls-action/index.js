import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getClient } from "../client_config/client";
import getUserConfig from "../client_config/getUserConfig";
import * as pulls from "./pulls/pulls";
import * as workflow_run from "./workflow_run/workflow_run";

const run = async () => {
  try {
    const client = getClient();

    const { owner, repo } = context.issue;
    const payload = context.payload;

    if (context.eventName === "pull_request") {
      // Get user configuration
      client.config = await getUserConfig(client, owner, repo);

      pulls.run(client, payload);
    } else if (context.eventName === "workflow_run") {
      workflow_run.run(client, payload, owner, repo);
    }
  } catch (error) {
    setFailed(error.message);
  }
};

// Run the script
run();
