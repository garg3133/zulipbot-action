import { Issue } from "@octokit/webhooks-types";
import { CommandsActionClient } from "../../../types";

export default async function rejectLabels(
  labelsToReject: string[],
  client: CommandsActionClient,
  issue: Issue,
  owner: string,
  repo: string
): Promise<void> {
  if (!labelsToReject.length) return;

  const labelErrorTemplate = client.templates.get("labelError");
  if (!labelErrorTemplate) return;

  const one = labelsToReject.length === 1;
  const type = issue.pull_request ? "pull request" : "issue";
  const labelError = labelErrorTemplate.format({
    label: `Label${one ? "" : "s"}`,
    labelList: `"${labelsToReject.join('", "')}"`,
    does: `do${one ? "es" : ""}`,
    this_label: `${one ? "this label" : "these labels"}`,
    type: type,
  });

  client.octokit.issues.createComment({
    owner,
    repo,
    issue_number: issue.number,
    body: labelError,
  });
}
