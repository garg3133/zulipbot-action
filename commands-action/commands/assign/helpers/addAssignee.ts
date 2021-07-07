import { setFailed } from "@actions/core";

import { CommandsActionClient } from "../../../types";

export default async function addAssignee(
  client: CommandsActionClient,
  commenter: string,
  number: number,
  owner: string,
  repo: string
): Promise<void> {
  try {
    await client.octokit.issues.addAssignees({
      owner,
      repo,
      issue_number: number,
      assignees: [commenter],
    });
  } catch (error) {
    setFailed(
      `Failed to assign #${number} to ${commenter}. Error: ${error.message}`
    );
  }
}
