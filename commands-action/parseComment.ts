import { CommandsActionClient } from "./types";
import { IssueComment } from "@octokit/webhooks-types";

interface CommandsToRunInterface {
  [key: string]: string;
}

export default function parseComment(
  client: CommandsActionClient,
  comment: IssueComment
): CommandsToRunInterface {
  const commands: CommandsToRunInterface = {};
  const commentBody = comment.body;
  const commenter = comment.user.login;

  if (commenter === client.username || !commentBody) return commands;

  const regex = RegExp(`@${client.username} +(\\w+)( +(--\\w+|"[^"]+"))*`, "g");
  const parsed = commentBody.match(regex);
  if (!parsed) return commands;

  parsed.forEach((command) => {
    const codeBlocks = [`\`\`\`\r\n${command}\r\n\`\`\``, `\`${command}\``];
    if (codeBlocks.some((block) => commentBody.includes(block))) return;

    const [, keyword] = command.replace(/\s+/, " ").split(" ");
    const args = command.replace(/\s+/, " ").split(" ").slice(2).join(" ");

    commands[keyword] = args;
  });

  console.log("Commands:", commands);
  return commands;
}
