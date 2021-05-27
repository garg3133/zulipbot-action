import { setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getClient, getClientLogin } from "../client_config/client";
import getUserConfig from "../client_config/getUserConfig";
import getBotCommands from "./commands/getBotCommands";
import getTemplates from "../client_config/getTemplates";
import parseComment from "./parseComment";

const run = async () => {
  try {
    // Works for both issue comment and PR comment.
    if (context.eventName !== "issue_comment") return;

    const client = getClient();

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

    const payload = context.payload;

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

function parse_comment(client, payload) {
  const data = payload.comment;
  const commenter = data.user.login;
  const body = data.body;
  const username = client.username;

  if (commenter === username || !body) return;

  const prefix = RegExp(`@${username} +(\\w+)( +(--\\w+|"[^"]+"))*`, "g");
  const parsed = body.match(prefix);
  if (!parsed) return;

  parsed.forEach((command) => {
    const codeBlocks = [`\`\`\`\r\n${command}\r\n\`\`\``, `\`${command}\``];
    if (codeBlocks.some((block) => body.includes(block))) return;
    const [, keyword] = command.replace(/\s+/, " ").split(" ");
    const args = command.replace(/\s+/, " ").split(" ").slice(2).join(" ");
    const file = client.commands.get(keyword);

    // Return {keyword: args}
    // Return {keyword: {args: ..., ...:...}} incase of more data.

    if (file) {
      file.run.apply(client, [payload, commenter, args]);
    }
  });
}

// Run the script
run();
