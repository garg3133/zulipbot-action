import { setFailed } from "@actions/core";

import { Client } from "../../../types";

export default async function addAssignee(
  client: Client,
  commenter: string,
  number: number,
  owner: string,
  repo: string
): Promise<void> {
  try {
    await client.issues.addAssignees({
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
