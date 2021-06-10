import { setFailed } from "@actions/core";
import * as fs from "fs";
import { PullsActionClient } from "..";
import getNewSizeLabel from "./getNewSizeLabel";

import {
  PullRequestOpenedEvent,
  PullRequestSynchronizeEvent,
} from "@octokit/webhooks-types";
import { ArtifactInterface } from "../interfaces";

export default async function updateSizeLabel(
  client: PullsActionClient,
  payload: PullRequestOpenedEvent | PullRequestSynchronizeEvent,
  owner: string,
  repo: string
): Promise<void> {
  try {
    const number = payload.pull_request.number;
    const pullLabels = payload.pull_request.labels.map((label) => label.name);

    const sizeLabels = client.config.size_labels?.labels;

    if (!sizeLabels || Object.keys(sizeLabels).length == 0) {
      throw new Error("Size Labels not found in configuration file.");
    }

    if (typeof sizeLabels !== "object" || Array.isArray(sizeLabels)) {
      throw new Error(
        "Size labels should be in the format of object/dictionary."
      );
    }

    const newSizeLabel = await getNewSizeLabel(
      client,
      number,
      sizeLabels,
      owner,
      repo
    );
    if (newSizeLabel === "") {
      throw new Error("No size label matched for the number of lines changed.");
    }

    // Create an artifact
    const artifactContent: ArtifactInterface = {
      number: number,
      action: "none",
    };

    if (!pullLabels.includes(newSizeLabel)) {
      artifactContent.action = "sizeLabel";
      artifactContent.add = newSizeLabel;

      const oldSizeLabel = pullLabels.filter((label) => {
        return Object.keys(sizeLabels).includes(label);
      });

      if (oldSizeLabel.length) artifactContent.remove = oldSizeLabel[0];
    }

    // Save artifact
    const artifactContentJson = JSON.stringify(artifactContent);

    fs.writeFile("artifact.json", artifactContentJson, "utf-8", (err) => {
      if (err) throw err;
      console.log("Artifact saved!");
    });
  } catch (error) {
    setFailed(error.message);
  }
}
