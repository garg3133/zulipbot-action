export const run = async (client, payload, args, owner, repo) => {
  const number = payload.issue.number;
  const commenter = payload.comment.user.login;
  const assignees = payload.issue.assignees.map((assignee) => assignee.login);

  if (!assignees.includes(commenter)) {
    const error = "**ERROR:** You have not claimed this issue to work on yet.";
    return client.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: error,
    });
  }

  return client.issues.removeAssignees({
    owner,
    repo,
    issue_number: number,
    assignees: [commenter],
  });
};
