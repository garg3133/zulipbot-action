import * as core from "@actions/core";
import * as github from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";

export type OctokitClient = InstanceType<typeof GitHub>;

export const getOctokit = (): OctokitClient => {
  const token: string = core.getInput("token", { required: true });
  const octokit: OctokitClient = github.getOctokit("", { auth: token });

  return octokit;
};

export const getOctokitLogin = async (
  octokit: OctokitClient
): Promise<string> => {
  let login: string;

  try {
    const { data } = await octokit.users.getAuthenticated();
    login = data.login;
  } catch (error) {
    throw new Error(
      `Received unexpected API status code ${error.status} while requesting for bot's username.`
    );
  }

  return login;
};
