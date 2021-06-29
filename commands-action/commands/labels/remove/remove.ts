import isCommenterPermitted from "../isCommenterPermitted";
import rejectLabels from "../rejectLabels";
import { setFailed } from "@actions/core";

import { IssueCommentCreatedEvent } from "@octokit/webhooks-types";
import { CommandsActionClient } from "../../../types";

export const run = async (
  client: CommandsActionClient,
  payload: IssueCommentCreatedEvent,
  args: string,
  owner: string,
  repo: string
): Promise<void> => {
  if (!client.config.labels) return;

  const labelsInArgs = args.match(/".*?"/);
  if (!labelsInArgs) {
    setFailed("No labels provided to be removed.");
    return;
  }

  const fullPermission = client.config.labels.full_permission;
  const restrictedPermission = client.config.labels.restricted_permission;

  const commenter = payload.comment.user.login;
  const number = payload.issue.number;
  const issueAuthor = payload.issue.user.login;
  const issueLabels = payload.issue.labels.map((label) => label.name);
  const isOrg = payload.repository.owner.type === "Organization";

  const labels = labelsInArgs.map((string) => string.replace(/"/g, ""));

  const labelsToReject = labels.filter((label) => !issueLabels.includes(label));
  let labelsToRemove = labels.filter((label) => issueLabels.includes(label));

  if (fullPermission && fullPermission.to) {
    const permittedToLabel = fullPermission.to;

    const commenterPermitted: boolean = await isCommenterPermitted(
      client,
      permittedToLabel,
      commenter,
      issueAuthor,
      isOrg,
      owner
    );

    if (commenterPermitted) {
      rejectLabels(labelsToReject, client, payload.issue, owner, repo);

      let newLabels = issueLabels.filter(
        (label) => !labelsToRemove.includes(label)
      );
      if (labelsToRemove.length) {
        client.octokit.issues.setLabels({
          owner,
          repo,
          issue_number: number,
          labels: newLabels,
        });
      }
      return;
    }
  }

  if (restrictedPermission && restrictedPermission.to) {
    const allowedLabels = restrictedPermission.allowed_labels;
    const restrictedLabels = restrictedPermission.restricted_labels;

    if (
      (!allowedLabels && !restrictedLabels) ||
      (allowedLabels && restrictedLabels)
    ) {
      throw new Error(
        "Please mention exactly one of `allowed_labels` or `restricted_labels` in `restricted_permission` config."
      );
    }

    if (allowedLabels) {
      labelsToReject.concat(
        labelsToRemove.filter((label) => !allowedLabels.includes(label))
      );
      labelsToRemove = labelsToRemove.filter((label) =>
        allowedLabels.includes(label)
      );
    } else if (restrictedLabels) {
      labelsToReject.concat(
        labelsToRemove.filter((label) => restrictedLabels.includes(label))
      );
      labelsToRemove = labelsToRemove.filter(
        (label) => !restrictedLabels.includes(label)
      );
    }

    const permittedToLabel = restrictedPermission.to;

    const commenterPermitted = await isCommenterPermitted(
      client,
      permittedToLabel,
      commenter,
      issueAuthor,
      isOrg,
      owner
    );

    if (commenterPermitted) {
      rejectLabels(labelsToReject, client, payload.issue, owner, repo);

      const newLabels = issueLabels.filter(
        (label) => !labelsToRemove.includes(label)
      );
      if (labelsToRemove.length) {
        client.octokit.issues.setLabels({
          owner,
          repo,
          issue_number: number,
          labels: newLabels,
        });
      }
      return;
    }
  }

  const error = `**Error:** @${commenter} not permitted to remove labels using this command.`;
  client.octokit.issues.createComment({
    owner,
    repo,
    issue_number: number,
    body: error,
  });
};
