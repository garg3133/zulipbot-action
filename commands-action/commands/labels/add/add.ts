import { getAllPages } from "../../../../utils";
import isCommenterPermitted from "../isCommenterPermitted";
import rejectLabels from "../rejectLabels";
import { setFailed } from "@actions/core";

import { IssueCommentCreatedEvent, Label } from "@octokit/webhooks-types";
import { CommandsActionClient } from "../../../types";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type ListLabelsForRepoParameters =
  RestEndpointMethodTypes["issues"]["listLabelsForRepo"]["parameters"];

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
    setFailed("No labels provided to be added.");
    return;
  }

  const fullPermission = client.config.labels.full_permission;
  const restrictedPermission = client.config.labels.restricted_permission;

  const commenter = payload.issue.user.login;
  const number = payload.issue.number;
  const issueAuthor = payload.issue.user.login;
  const issueLabels = payload.issue.labels.map((label) => label.name);

  const repoLabelsArray: Label[] = await getAllPages<
    ListLabelsForRepoParameters,
    Label
  >(client.octokit, "issues", "listLabelsForRepo", { owner, repo });

  const repoLabels = repoLabelsArray.map((label) => label.name);
  const labels = labelsInArgs.map((string) => string.replace(/"/g, ""));

  const isOrg = payload.repository.owner.type === "Organization";

  const labelsToReject = labels.filter((label) => !repoLabels.includes(label));
  let labelsToAdd = labels.filter(
    (label) => repoLabels.includes(label) && !issueLabels.includes(label)
  );

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

      if (labelsToAdd.length) {
        client.octokit.issues.addLabels({
          owner,
          repo,
          issue_number: number,
          labels: labelsToAdd,
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
        labelsToAdd.filter((label) => !allowedLabels.includes(label))
      );
      labelsToAdd = labelsToAdd.filter((label) =>
        allowedLabels.includes(label)
      );
    } else if (restrictedLabels) {
      labelsToReject.concat(
        labelsToAdd.filter((label) => restrictedLabels.includes(label))
      );
      labelsToAdd = labelsToAdd.filter(
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

      if (labelsToAdd.length) {
        client.octokit.issues.addLabels({
          owner,
          repo,
          issue_number: number,
          labels: labelsToAdd,
        });
      }
      return;
    }
  }

  const error = `**Error:** @${commenter} not permitted to add labels using this command.`;
  client.octokit.issues.createComment({
    owner,
    repo,
    issue_number: number,
    body: error,
  });
};
