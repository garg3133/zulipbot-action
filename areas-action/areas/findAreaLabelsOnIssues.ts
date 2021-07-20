import * as utils from "../../utils";

import { AreasActionClient } from "../types";

export default async function findAreaLabelsOnIssues(
  client: AreasActionClient,
  allowedAreaLabels: string[],
  linkedIssues: number[],
  owner: string,
  repo: string
): Promise<string[]> {
  let areaLabelsOnIssues: string[] = [];

  for (const number of linkedIssues) {
    const { data } = await client.octokit.issues.get({
      owner,
      repo,
      issue_number: number,
    });

    if (data.pull_request) continue;

    const issueLabels = data.labels
      .map((label) => {
        if (typeof label === "string" || !label.name) return "";
        else return label.name;
      })
      .filter((label) => label);

    const issueAreaLabels = issueLabels.filter((label) =>
      allowedAreaLabels.includes(label)
    );

    areaLabelsOnIssues.push(...issueAreaLabels);
  }

  return utils.deduplicate<string>(areaLabelsOnIssues);
}
