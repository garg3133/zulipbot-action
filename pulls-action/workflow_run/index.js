import { setFailed } from "@actions/core";
import getArtifactData from "./getArtifactData";

export const run = async (client, payload, owner, repo) => {
  try {
    const artifactData = await getArtifactData(client, payload, owner, repo);

    if (artifactData.action === "sizeLabel") {
      if (artifactData.remove) {
        await client.issues.removeLabel({
          owner,
          repo,
          issue_number: artifactData.number,
          name: artifactData.remove,
        });
      }

      await client.issues.addLabels({
        owner,
        repo,
        issue_number: artifactData.number,
        labels: [artifactData.add],
      });
    }
  } catch (error) {
    setFailed(error.message);
  }
};
