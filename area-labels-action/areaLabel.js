exports.run = async function (client, payload) {
  const issue = payload.issue || payload.pull_request;
  const number = issue.number;
  const issueLabels = issue.labels.map((label) => label.name);
  const areaLabel = payload.label.name;
  const repoName = payload.repository.name;
  const repoOwner = payload.repository.owner.login;
  const allowedAreaLabels = client.config.area_labels;

  if (!(areaLabel in allowedAreaLabels)) return;

  const issueAreaLabels = issueLabels.filter(
    (label) => label in allowedAreaLabels
  );
  const labelTeams = issueAreaLabels.map((label) => allowedAreaLabels[label]);
  console.log(labelTeams);

  // Create unique array of teams (multiple labels can point to same team)
  const uniqueTeams = Array.from(new Set(labelTeams)).sort();
  console.log(uniqueTeams);

  // Get the issue in the latest state, to avoid editing the issue multiple
  // times with the same teams, when labels area added in bulk.
  // Issues API also supports pull requests.
  const { status, data: updatedIssue } = await client.issues.get({
    owner: repoOwner,
    repo: repoName,
    issue_number: number,
  });
  if (status !== 200) {
    throw new Error(
      `Received unexpected API status code ${status} while searching for issue.`
    );
  }

  const prefix = `CC by @${client.username}: `;
  const areaTeams = `@${repoOwner}/${uniqueTeams.join(`, @${repoOwner}/`)}`;

  const newCC = `${prefix}${areaTeams}`;
  console.log(newCC);

  const pattern = new RegExp(`${prefix}.+$`, "m");
  const found = updatedIssue.body.match(pattern);
  console.log(found);

  if (found) {
    console.log(found[0]);
    if (uniqueTeams.length) {
      if (found[0] !== newCC) {
        updatedIssue.body = updatedIssue.body.replace(pattern, newCC);
      } else {
        return;
      }
    } else {
      updatedIssue.body = updatedIssue.body.replace(pattern, "");
    }
  } else {
    if (uniqueTeams.length) {
      updatedIssue.body += `\n\n${newCC}`;
    } else {
      return;
    }
  }

  client.issues.update({
    owner: repoOwner,
    repo: repoName,
    issue_number: number,
    body: updatedIssue.body,
  });
};
