import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";

export const getClient = async () => {
  // Get octokit
  const token = core.getInput("token", { required: true });
  const client = github.getOctokit("", { auth: token });

  return client;
};

export const getActionConfig = async (client, owner, repo) => {
  const config_file_path = core.getInput('config-file-path');

  try {
    const {status, data: {content: config_data_encoded}} = await client.repos.getContent({
      owner,
      repo,
      path: config_file_path
    });

    if (status !== 200) {
      throw new Error(`Received unexpected API status code while requsting config ${status}`);
    }

    if (!config_data_encoded) {
      throw new Error('Configuration file not found.')
    }

    const config_data_string = Buffer.from(config_data_encoded, 'base64').toString('utf-8');
    const config_data = yaml.load(config_data_string);

    return config_data;

  } catch (error) {
    core.setFailed(error.message);
  }
}
