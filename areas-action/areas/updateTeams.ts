import { AreasActionClient } from "../types";

export default async function updateTeams(
  client: AreasActionClient,
  number: number,
  teams: string[],
  owner: string,
  repo: string
): Promise<void> {
  // Get the issue in the latest state, to avoid editing the issue description
  // with the same teams multiple times, when labels area added in bulk.
  // Issues API also supports pull requests.
  let updatedIssueBody: string | undefined;
  try {
    const { data } = await client.octokit.issues.get({
      owner: owner,
      repo: repo,
      issue_number: number,
    });
    updatedIssueBody = data.body;
  } catch (error) {
    throw new Error(
      `Received unexpected API response while requesting for updated issue: ${error.status}. Error: ${error.message}`
    );
  }

  if (!updatedIssueBody) updatedIssueBody = "";

  const prefix = `CC by @${client.username}: `;
  const areaTeams = `@${owner}/${teams.join(`, @${owner}/`)}`;

  const newCC = `${prefix}${areaTeams}`;
  console.log(newCC);

  const pattern = new RegExp(`^${prefix}.+$`, "m");
  const found = updatedIssueBody.match(pattern);
  console.log(found);

  if (found) {
    // CC already present.
    const oldCC = found[0];
    console.log(oldCC);
    if (teams.length) {
      if (oldCC !== newCC) {
        updatedIssueBody = updatedIssueBody.replace(pattern, newCC);
      } else {
        return;
      }
    } else {
      updatedIssueBody = updatedIssueBody.replace(pattern, "");
    }
  } else {
    // CC not already present.
    if (teams.length) {
      updatedIssueBody += `\n\n${newCC}`;
    } else {
      return;
    }
  }

  await client.octokit.issues.update({
    owner: owner,
    repo: repo,
    issue_number: number,
    body: updatedIssueBody,
  });
}
