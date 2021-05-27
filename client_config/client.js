import * as core from "@actions/core";
import * as github from "@actions/github";

export const getClient = () => {
  const token = core.getInput("token", { required: true });
  const client = github.getOctokit("", { auth: token });

  return client;
};

export const getClientLogin = async (client) => {
  let response;

  try {
    response = await client.users.getAuthenticated();
  } catch (error) {
    throw new Error(
      `Received unexpected API status code ${error.status} while requesting for bot's username.`
    );
  }

  const login = response.data.login;
  if (!login) {
    throw new Error("Unable to get bot's username.");
  }

  return login;
};
