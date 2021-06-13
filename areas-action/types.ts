import { AreasActionUserConfigInterface } from "./interfaces";
import { OctokitClient } from "../client/octokit";

export type AreasActionClient = {
  octokit: OctokitClient;
  username: string;
  config: AreasActionUserConfigInterface;
};
