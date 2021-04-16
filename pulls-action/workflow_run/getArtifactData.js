import * as fs from "fs";
import * as AdmZip from "adm-zip";
import { setFailed } from "@actions/core";

export default async function(client, payload, owner, repo) {
  try {
    const artifacts = await client.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: payload.workflow_run.id,
    });

    const matchedArtifacts = artifacts.data.artifacts.filter((artifact) => {
      return artifact.name === "pull_artifact";
    });

    if (matchedArtifacts.length === 0) {
      return new Error('Artifact with name "pull_artifact" not found. Exiting.');
    }

    const artifact = matchedArtifacts[0];

    const download = await client.actions.downloadArtifact({
      owner,
      repo,
      artifact_id: artifact.id,
      archive_format: "zip",
    });

    fs.writeFileSync('pull_artifact.zip', Buffer.from(download.data));

    const extractZip = new AdmZip('./pull_artifact.zip');
    extractZip.extractEntryTo('artifact.json', './');

    const artifactContent = fs.readFileSync('artifact.json', 'utf-8');
    const artifactContentJson = JSON.parse(artifactContent);

    console.log(artifactContentJson);

    return artifactContentJson;
  } catch (error) {
    setFailed(error.message);
  }
}