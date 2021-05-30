import * as core from "@actions/core";
import * as github from "@actions/github";
import { Client } from "../types";

export const getClient = (): Client => {
  const token: string = core.getInput("token", { required: true });
  const client: Client = github.getOctokit("", { auth: token });

  return client;
};

export const getClientLogin = async (client: Client): Promise<string> => {
  let login: string;

  try {
    const response = await client.users.getAuthenticated();
    login = response.data.login;
  } catch (error) {
    throw new Error(
      `Received unexpected API status code ${error.status} while requesting for bot's username.`
    );
  }

  return login;
};
