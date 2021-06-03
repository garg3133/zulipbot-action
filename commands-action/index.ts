import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getClient, getClientLogin } from "../client_config/client";
import getUserConfig from "../client_config/getUserConfig";
import getBotCommands from "./commands/getBotCommands";
import getTemplates from "../client_config/getTemplates";
import parseComment from "./parseComment";

import { Client } from "../types";
import { IssueCommentEvent } from "@octokit/webhooks-types";

const run = async (): Promise<void> => {
  try {
    // Works for both issue comment and PR comment.
    if (context.eventName !== "issue_comment") return;

    const client: Client = getClient();

    // Use promise.all() below??

    // Get bot's username
    client.username = await getClientLogin(client);

    const { owner, repo } = context.issue;

    // Get user configuration
    client.config = await getUserConfig(client, owner, repo);

    // Get supported commands
    client.commands = getBotCommands();

    // Get templates
    client.templates = await getTemplates(client, owner, repo);

    const payload = context.payload as IssueCommentEvent;

    if (payload.action === "created") {
      const commandsToRun = parseComment(client, payload.comment);

      for (const [command, args] of Object.entries(commandsToRun)) {
        const command_run = client.commands.get(command);

        if (command_run) {
          command_run(client, payload, args, owner, repo);
        }
      }
    }
  } catch (error) {
    setFailed(error.message);
  }
};

// Run the script
run();
