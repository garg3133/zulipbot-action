import { setFailed } from "@actions/core";
import { deduplicate } from "../../utils";
import updateTeams from "./updateTeams";

import {
  Issue,
  IssuesLabeledEvent,
  IssuesUnlabeledEvent,
  PullRequest,
  PullRequestLabeledEvent,
  PullRequestUnlabeledEvent,
} from "@octokit/webhooks-types";
import { AreasActionClient } from "../types";

export const run = async (
  client: AreasActionClient,
  payload:
    | IssuesLabeledEvent
    | IssuesUnlabeledEvent
    | PullRequestLabeledEvent
    | PullRequestUnlabeledEvent,
  owner: string,
  repo: string
): Promise<void> => {
  let issue: Issue | PullRequest;
  if ("issue" in payload) {
    issue = payload.issue;
  } else {
    issue = payload.pull_request;
  }

  const label = payload.label;
  const number = issue.number;

  let labels: string[];
  if (issue.labels) {
    labels = issue.labels.map((label) => label.name);
  } else {
    const { data } = await client.octokit.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number: number,
    });
    labels = data.map((label) => label.name);
  }

  const allowedAreaLabels = client.config.area_labels;
  if (!allowedAreaLabels || typeof allowedAreaLabels !== "object") {
    setFailed("Unable to read 'area_labels' config as an object.");
    return;
  }

  if (label && !(label.name in allowedAreaLabels)) return;

  const issueAreaLabels = labels.filter((label) => label in allowedAreaLabels);

  const teams = issueAreaLabels.map((label) => allowedAreaLabels[label]);
  console.log("Teams:", teams);

  // Deduplicate and sort teams (multiple labels can point to same team)
  const uniqueTeams = deduplicate<string>(teams);
  console.log("Unique Teams:", uniqueTeams);

  await updateTeams(client, number, uniqueTeams, owner, repo);
};
