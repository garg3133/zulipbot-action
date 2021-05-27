import { getInput } from "@actions/core";
import { load as yaml_load } from "js-yaml";

export default async function getUserConfig(client, owner, repo) {
  const config_file_path = getInput("config-file-path");

  const path_split = config_file_path.split(".");
  const file_ext = path_split[path_split.length - 1];
  if (!file_ext.match(/^y[a]?ml$/i)) {
    throw new Error(
      "Please provide path to a YAML config file in your workflow."
    );
  }

  let response;

  try {
    response = await client.repos.getContent({
      owner,
      repo,
      path: config_file_path,
    });
  } catch (error) {
    if (error.status === 404) {
      throw new Error("Configuration file not found.");
    } else {
      throw new Error(
        `Received unexpected API status code while requesting configuration file: ${status}`
      );
    }
  }

  const config_data_encoded = response.data.content;

  if (!config_data_encoded) {
    throw new Error("Unable to read the contents of the configuration file.");
  }

  const config_data_string = Buffer.from(
    config_data_encoded,
    "base64"
  ).toString("utf-8");

  const config_data = yaml_load(config_data_string);

  return config_data;
}
