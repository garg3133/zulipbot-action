import {setFailed} from "@actions/core";
import getNewSizeLabel from "./getNewSizeLabel";
import * as fs from "fs";

export default async function updateSizeLabel(client, payload) {
  try {
    const repo = payload.repository.name;
    const owner = payload.repository.owner.login;
    const number = payload.pull_request.number;

    const pullLabels = payload.pull_request.labels.map((label) => label.name);
    const configSizeLabels = client.config.size_labels.labels;

    if (!configSizeLabels || Object.keys(configSizeLabels).length == 0) {
      throw new Error("Size Labels not found in configuration file.");
    }

    const updatedSizeLabel = await getNewSizeLabel(client, number, owner, repo);

    // Create an artifact and save it.
    const artifactContent = {
      number: number,
    };

    if (!pullLabels.includes(updatedSizeLabel)) {
      artifactContent.action = "sizeLabel";
      artifactContent.add = updatedSizeLabel;

      const oldSizeLabel = pullLabels.filter(label => {
        return Object.keys(configSizeLabels).includes(label);
      });

      if (oldSizeLabel.length) artifactContent.remove = oldSizeLabel[0];
    } else {
      artifactContent.action = "none";
    }

    const artifactContentJson = JSON.stringify(artifactContent);

    fs.writeFile('artifact.json', artifactContentJson, 'utf-8', (err) => {
      if (err) throw err;
      console.log('Artifact saved!');
    });

  } catch (error) {
      setFailed(error.message);
  }
};
