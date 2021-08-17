import { getAllPages } from "../../utils";

import { PullsActionClient } from "../index";
import { PullRequest, PushEvent } from "@octokit/webhooks-types";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type PullsListParameters =
  RestEndpointMethodTypes["pulls"]["list"]["parameters"];

export const run = async (
  client: PullsActionClient,
  payload: PushEvent,
  owner: string,
  repo: string
): Promise<void> => {
  const mergeConflictsConfig = client.config.merge_conflicts;
  if (!mergeConflictsConfig) {
    throw new Error(
      "Please provide merge conflicts config or remove push event from your workflow file."
    );
  }

  const mergeConflictLabel = mergeConflictsConfig.label;
  if (!mergeConflictLabel) {
    throw new Error(
      "Please provide label to be used to mark PRs for merge conflicts."
    );
  }

  const mergeConflictCommentConfig = mergeConflictsConfig.comment;

  const pushRef = payload.ref.split("/");
  const branch = pushRef[pushRef.length - 1];

  const [api, method] = ["pulls", "list"];
  const parameters: PullsListParameters = {
    owner,
    repo,
    base: branch,
  };

  const pulls: PullRequest[] = await getAllPages<
    PullsListParameters,
    PullRequest
  >(client.octokit, api, method, parameters);

  for (const pull of pulls) {
    const number = pull.number;
    const mergable = pull.mergeable;
    const author = pull.user.login;
    const pullLabels = pull.labels.map((label) => label.name);

    if (pullLabels.includes(mergeConflictLabel)) {
      // Remove the merge conflict label if the PR is mergable now.
      if (mergable === true) {
        client.octokit.issues.removeLabel({
          owner,
          repo,
          issue_number: number,
          name: mergeConflictLabel,
        });
      }
      continue;
    }

    if (mergable === false) {
      client.octokit.issues.addLabels({
        owner,
        repo,
        issue_number: number,
        labels: [mergeConflictLabel],
      });

      if (mergeConflictCommentConfig) {
        const mergeConflictWarningTemplate = client.templates.get(
          "mergeConflictWarning"
        );
        if (!mergeConflictWarningTemplate) {
          throw new Error("Merge conflict warning template not found.");
        }

        const warning = mergeConflictWarningTemplate.format({
          author,
          branch,
          owner,
          repo,
        });

        client.octokit.issues.createComment({
          owner,
          repo,
          issue_number: number,
          body: warning,
        });
      }
    }
  }
};
