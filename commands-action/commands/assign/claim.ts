import addAssignee from "./helpers/addAssignee";

import { IssueCommentCreatedEvent } from "@octokit/webhooks-types";
import { CommandsActionClient } from "../../types";

export const run = async (
  client: CommandsActionClient,
  payload: IssueCommentCreatedEvent,
  args: string,
  owner: string,
  repo: string
): Promise<void> => {
  // Return if comment is made on a Pull Request.
  // Comment out the following line if you want to use the
  // assign feature on PRs too.
  if (payload.issue.pull_request) return;

  if (!("assign" in client.config) || !client.config.assign) return;

  if (client.config.assign === true) {
    // Use default config for assign
    client.config.assign = client.defaultConfig.assign;
  }

  console.log("Issue assign args:", args);

  const number: number = payload.issue.number;
  const commenter: string = payload.comment.user.login;
  const assignees: string[] = payload.issue.assignees.map(
    (assignee) => assignee.login
  );
  const limit: number =
    client.config.assign.max_assignees ||
    client.defaultConfig.assign.max_assignees;

  // Check if the issue is already assigned to the commenter.
  if (assignees.includes(commenter)) {
    const error: string = "**ERROR:** You have already claimed this issue.";
    await client.octokit.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: error,
    });
    return;
  }

  // Check if assigning the issue to the commenter will exceed the limit.
  if (assignees.length >= limit) {
    const multipleClaimWarningTemplate = client.templates.get(
      "multipleClaimWarning"
    );
    if (multipleClaimWarningTemplate) {
      const warn = multipleClaimWarningTemplate.format({ commenter });

      await client.octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: warn,
      });
    }
    return;
  }

  await addAssignee(client, commenter, number, owner, repo);
};
