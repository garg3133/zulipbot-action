import { getAllPages } from "../../utils";

import { PullsActionClient } from "../index";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type PullsListFilesParameters =
  RestEndpointMethodTypes["pulls"]["listFiles"]["parameters"];

type FileChanged =
  RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"][0];

interface SizeLabelsInterface {
  [key: string]: number;
}

export default async function getNewSizeLabel(
  client: PullsActionClient,
  number: number,
  sizeLabels: SizeLabelsInterface,
  owner: string,
  repo: string
): Promise<string> {
  const excludedFiles = client.config.size_labels?.exclude || [];

  // Get all changed files of PR
  const [api, method] = ["pulls", "listFiles"];
  const parameters: PullsListFilesParameters = {
    owner,
    repo,
    pull_number: number,
  };

  const files: FileChanged[] = await getAllPages<
    PullsListFilesParameters,
    FileChanged
  >(client.octokit, api, method, parameters);

  const changes = files
    .filter((file) => {
      const filenameMatch = excludedFiles.filter((excludedName) => {
        return file.filename.includes(excludedName);
      });
      return filenameMatch.length == 0;
    })
    .reduce((sum, file) => sum + file.changes, 0);

  let maxSize = -1;
  let newSizeLabel: string = "";

  for (const [name, size] of Object.entries(sizeLabels)) {
    if (size > maxSize && changes >= size) {
      maxSize = size;
      newSizeLabel = name;
    }
  }

  return newSizeLabel;
}
