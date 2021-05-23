import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getClient, getClientLogin } from "../client_config/client";
import getUserConfig from "../client_config/getUserConfig";
import * as areaLabel from "./areaLabel";

const run = async () => {
  try {
    const client = getClient();
    console.log(client);

    // Get bot's username
    client.username = await getClientLogin(client);
    console.log("Client username: ", client.username);

    const {owner, repo} = context.issue;

    // Get user configuration
    client.config = await getUserConfig(client, owner, repo);

    if (
      context.eventName !== "issues" &&
      context.eventName !== "pull_request_target"
    )
      return;

    const payload = context.payload;
    if (payload.action === "labeled" || payload.action === "unlabeled") {
      await areaLabel.run(client, payload);
    }
  } catch (error) {
    setFailed(error.message);
  }
};


// Run the script
run();
