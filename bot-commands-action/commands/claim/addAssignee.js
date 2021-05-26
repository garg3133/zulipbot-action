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

  console.log(response.data.assignees);
  // assignees === commenter ??
  if (response.data.assignees.length) return;

  const error = "**ERROR:** Issue claiming failed (no assignee was added).";

  return client.issues.createComment({
    owner,
    repo,
    issue_number: number,
    body: error,
  });
}
