import { setFailed } from "@actions/core";
import AdmZip from "adm-zip";
import * as fs from "fs";

import { PullsActionClient } from "../index";
import { ArtifactInterface } from "../interfaces";
import { WorkflowRunEvent } from "@octokit/webhooks-types";

export default async function (
  client: PullsActionClient,
  payload: WorkflowRunEvent,
  owner: string,
  repo: string
): Promise<ArtifactInterface | undefined> {
  try {
    const artifacts = await client.octokit.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: payload.workflow_run.id,
    });

    const matchedArtifacts = artifacts.data.artifacts.filter((artifact) => {
      return artifact.name === "pull_artifact";
    });

    if (matchedArtifacts.length === 0) {
      throw new Error('Artifact with name "pull_artifact" not found. Exiting.');
    }

    const artifact = matchedArtifacts[0];

    const download = await client.octokit.actions.downloadArtifact({
      owner,
      repo,
      artifact_id: artifact.id,
      archive_format: "zip",
    });

    fs.writeFileSync("pull_artifact.zip", Buffer.from(download.data as string));

    const extractZip = new AdmZip("./pull_artifact.zip");
    extractZip.extractEntryTo("artifact.json", "./");

    const artifactContent = fs.readFileSync("artifact.json", "utf-8");
    const artifactContentJson = JSON.parse(
      artifactContent
    ) as ArtifactInterface;

    console.log(artifactContentJson);

    return artifactContentJson;
  } catch (error) {
    setFailed(error.message);
  }
}
