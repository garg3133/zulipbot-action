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

  const {
    status,
    data: { content: config_data_encoded },
  } = await client.repos.getContent({
    owner,
    repo,
    path: config_file_path,
  });

  if (status !== 200) {
    throw new Error(
      `Received unexpected API status code while requesting config: ${status}`
    );
  }

  if (!config_data_encoded) {
    throw new Error("Configuration file not found.");
  }

  const config_data_string = Buffer.from(
    config_data_encoded,
    "base64"
  ).toString("utf-8");

  const config_data = yaml_load(config_data_string);

  return config_data;
}
