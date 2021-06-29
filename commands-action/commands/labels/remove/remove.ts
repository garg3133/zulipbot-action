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

  const fullPermissions = client.config.labels.full_permissions;
  const restrictedPermissions = client.config.labels.restricted_permissions;

  const commenter = payload.issue.user.login;
  const number = payload.issue.number;
  const issueAuthor = payload.issue.user.login;
  const issueLabels = payload.issue.labels.map((label) => label.name);
  const isOrg = payload.repository.owner.type === "Organization";

  const labels = labelsInArgs.map((string) => string.replace(/"/g, ""));

  const labelsToReject = labels.filter((label) => !issueLabels.includes(label));
  let labelsToRemove = labels.filter((label) => issueLabels.includes(label));

  if (fullPermissions && fullPermissions.to) {
    const permittedToLabel = fullPermissions.to;

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

  if (restrictedPermissions && restrictedPermissions.to) {
    const allowedLabels = restrictedPermissions.allowed_labels;
    const restrictedLabels = restrictedPermissions.restricted_labels;

    if (
      (!allowedLabels && !restrictedLabels) ||
      (allowedLabels && restrictedLabels)
    ) {
      throw new Error(
        "Please mention exactly one of `allowed_labels` or `restricted_labels` in `restricted_permissions` config."
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

    const permittedToLabel = restrictedPermissions.to;

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
