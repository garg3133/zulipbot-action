import Template from "./structures/Template";
import { GitHub } from "@actions/github/lib/utils";
import { IssueCommentCreatedEvent } from "@octokit/webhooks-types";
import {
  AreasActionConfigInterface,
  CommandsActionConfigInterface,
} from "./interfaces";

export type UserConfig =
  | CommandsActionConfigInterface
  | AreasActionConfigInterface;

export type Client = InstanceType<typeof GitHub> & {
  username?: string;
  config?: UserConfig;
  commands?: Map<string, CommandRunFunction>;
  templates?: Map<string, Template>;
};

export type CommandRunFunction = (
  client: Client,
  payload: IssueCommentCreatedEvent,
  args: string,
  owner: string,
  repo: string
) => Promise<void>;
