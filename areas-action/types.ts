import { AreasActionUserConfigInterface } from "./interfaces";
import { OctokitClient } from "../types";

export type AreasActionClient = {
  octokit: OctokitClient;
  username: string;
  config: AreasActionUserConfigInterface;
};
