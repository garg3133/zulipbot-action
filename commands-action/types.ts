import { IssueCommentCreatedEvent } from "@octokit/webhooks-types";
import { OctokitClient } from "../types";
import Template from "../structures/Template";
import { CommandsActionUserConfigInterface } from "./interfaces";

export type CommandsActionClient = {
  octokit: OctokitClient;
  username: string;
  config: CommandsActionUserConfigInterface;
  commands: Map<string, CommandRunFunction>;
  templates: Map<string, Template>;
};

export type CommandRunFunction = (
  client: CommandsActionClient,
  payload: IssueCommentCreatedEvent,
  args: string,
  owner: string,
  repo: string
) => Promise<void>;
