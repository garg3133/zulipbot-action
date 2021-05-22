import { getInput, setFailed } from "@actions/core";
import { load as yaml_load } from "js-yaml";

export default async function getUserConfig(client, owner, repo) {
  const config_file_path = getInput('config-file-path');

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
    const config_data = yaml_load(config_data_string);

    return config_data;

  } catch (error) {
    setFailed(error.message);
  }
}

