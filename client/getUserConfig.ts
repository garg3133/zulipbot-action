import { getInput } from "@actions/core";
import { load as yaml_load } from "js-yaml";

import { OctokitClient } from "../client/octokit";

export default async function getUserConfig(
  octokit: OctokitClient,
  owner: string,
  repo: string
): Promise<object> {
  const config_file_path: string = getInput("config-file-path");

  const path_split: string[] = config_file_path.split(".");
  const file_ext: string = path_split[path_split.length - 1];
  if (!file_ext.match(/^y[a]?ml$/i)) {
    throw new Error(
      "Please provide path to a YAML config file in your workflow."
    );
  }

  let config_data_encoded: string | undefined;

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: config_file_path,
    });
    if ("content" in data) config_data_encoded = data.content;
  } catch (error) {
    if (error.status === 404) {
      throw new Error("Configuration file not found.");
    } else {
      throw new Error(
        `Received unexpected API status code while requesting configuration file: ${error.status}`
      );
    }
  }

  // In case path to a folder is provided (will not have the property content)
  // or the config file is empty.
  if (!config_data_encoded) {
    throw new Error("Unable to read the contents of the configuration file.");
  }

  const config_data_string = Buffer.from(
    config_data_encoded,
    "base64"
  ).toString("utf-8");

  const config_data = yaml_load(config_data_string);

  if (!(typeof config_data === "object" && config_data !== null)) {
    throw new Error(
      "Unable to convert the config file to a JS object. Please check the format of your config file."
    );
  }

  return config_data;
}
