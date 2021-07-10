import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getOctokit, getOctokitLogin } from "../client/octokit";
import getUserConfig from "../client/getUserConfig";
import getTemplates from "../client/getTemplates";
import getBotCommands from "./commands/getBotCommands";
import parseComment from "./parseComment";
import Template from "../structures/Template";

import { IssueCommentEvent } from "@octokit/webhooks-types";
import { OctokitClient } from "../client/octokit";
import { CommandsActionClient } from "./types";
import { CommandsActionUserConfigInterface } from "./interfaces";

const run = async (): Promise<void> => {
  try {
    // Works for both issue comment and PR comment.
    if (context.eventName !== "issue_comment") return;

    const { owner, repo } = context.issue;

    // Create CommandsActionClient object
    const octokit: OctokitClient = getOctokit();

    const [username, config, templates]: [
      string,
      CommandsActionUserConfigInterface,
      Map<string, Template>
    ] = await Promise.all([
      getOctokitLogin(octokit),
      getUserConfig(octokit, owner, repo),
      getTemplates(octokit, owner, repo),
    ]);

    const commands = getBotCommands();

    const client: CommandsActionClient = {
      octokit: octokit,
      username: username,
      config: config,
      templates: templates,
      commands: commands,
    };

    const payload = context.payload as IssueCommentEvent;

    if (payload.action === "created") {
      const commandsToRun = parseComment(client, payload.comment);

      for (const [command, args] of Object.entries(commandsToRun)) {
        const command_run = client.commands.get(command);

        console.log(command_run);

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
