import * as utils from "../../utils";
import Search from "../../structures/ReferenceSearch";

import {
  PullRequestEditedEvent,
  PullRequestOpenedEvent,
  PullRequestSynchronizeEvent,
} from "@octokit/webhooks-types";
import { AreasActionClient } from "../types";
import findAreaLabelsOnIssues from "./findAreaLabelsOnIssues";

export default async function addLabelsToLinkedPulls(
  client: AreasActionClient,
  payload:
    | PullRequestOpenedEvent
    | PullRequestEditedEvent
    | PullRequestSynchronizeEvent,
  owner: string,
  repo: string
): Promise<void> {
  if (!client.config.copy_area_labels_to_pulls) return;

  const areaLabelsConfig = client.config.area_labels;
  if (!areaLabelsConfig) {
    throw new Error("area_labels config not found.");
  }

  const allowedAreaLabels = Object.keys(areaLabelsConfig);

  // Find all the linked issues to the PR and its commits
  const references = new Search(
    client.octokit,
    payload.pull_request,
    owner,
    repo
  );
  const bodyRefs = await references.getBody();
  const commitRefs = await references.getCommits();

  if (bodyRefs.length || commitRefs.length) {
    const refs = commitRefs.concat(bodyRefs);

    // sort and remove duplicate references
    const linkedIssues = utils.deduplicate<number>(refs);

    const areaLabelsOnLinkedIssues = await findAreaLabelsOnIssues(
      client,
      allowedAreaLabels,
      linkedIssues,
      owner,
      repo
    );

    const pullLabels = payload.pull_request.labels.map((label) => label.name);
    const pullLabelsSorted = utils.deduplicate<string>(pullLabels);

    const pullNonAreaLabels = pullLabels.filter(
      (label) => !allowedAreaLabels.includes(label)
    );

    const newLabels = pullNonAreaLabels.concat(areaLabelsOnLinkedIssues);
    const newLabelsSorted = utils.deduplicate<string>(newLabels);

    if (newLabelsSorted.toString() === pullLabelsSorted.toString()) return;

    await client.octokit.issues.setLabels({
      owner,
      repo,
      issue_number: payload.number,
      labels: newLabels,
    });
  }
}
