import Template from "../structures/Template";
import { OctokitClient } from "../client/octokit";
import { ActivityActionUserConfigInterface } from "./interfaces";

export type ActivityActionClient = {
  octokit: OctokitClient;
  username: string;
  config: ActivityActionUserConfigInterface;
  templates: Map<string, Template>;
};
