import { setFailed } from "@actions/core";

import { Client } from "../../../types";
import { IssueCommentCreatedEvent } from "@octokit/webhooks-types";

export const run = async (
  client: Client,
  payload: IssueCommentCreatedEvent,
  args: string,
  owner: string,
  repo: string
): Promise<void> => {
  const number = payload.issue.number;
  const commenter = payload.comment.user.login;
  const assignees = payload.issue.assignees.map((assignee) => assignee.login);

  if (!assignees.includes(commenter)) {
    const error: string =
      "**ERROR:** You have not claimed this issue to work on yet.";
    try {
      await client.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: error,
      });
    } catch {}
    return;
  }
  try {
    await client.issues.removeAssignees({
      owner,
      repo,
      issue_number: number,
      assignees: [commenter],
    });
  } catch (error) {
    setFailed(
      `Failed to remove the assignee from #${number}. Error: ${error.message}`
    );
  }
};
