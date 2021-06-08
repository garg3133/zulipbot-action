import Template from "../structures/Template";
import { OctokitClient } from "../types";
import { ActivityActionUserConfigInterface } from "./interfaces";

export type ActivityActionClient = {
  octokit: OctokitClient;
  username: string;
  config: ActivityActionUserConfigInterface;
  templates: Map<string, Template>;
};
