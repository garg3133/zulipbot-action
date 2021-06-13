import { IssueCommentCreatedEvent } from "@octokit/webhooks-types";
import { OctokitClient } from "../client/octokit";
import Template from "../structures/Template";
import {
  CommandsActionDefaultConfigInterface,
  CommandsActionUserConfigInterface,
} from "./interfaces";

export type CommandsActionClient = {
  octokit: OctokitClient;
  username: string;
  config: CommandsActionUserConfigInterface;
  commands: Map<string, CommandRunFunction>;
  templates: Map<string, Template>;
  defaultConfig: CommandsActionDefaultConfigInterface;
};

export type CommandRunFunction = (
  client: CommandsActionClient,
  payload: IssueCommentCreatedEvent,
  args: string,
  owner: string,
  repo: string
) => Promise<void>;
