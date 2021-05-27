export default async function addAssignee(
  client,
  commenter,
  number,
  owner,
  repo
) {
  const response = await client.issues.addAssignees({
    owner,
    repo,
    issue_number: number,
    assignees: [commenter],
  });

  const assignees = response.data.assignees.map((assignee) => assignee.login);
  if (assignees.includes(commenter)) return;

  const error = "**ERROR:** Issue claiming failed (no assignee was added).";

  return client.issues.createComment({
    owner,
    repo,
    issue_number: number,
    body: error,
  });
}
