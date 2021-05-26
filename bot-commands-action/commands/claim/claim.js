import addAssignee from "./addAssignee";

export const run = async (client, payload, args, owner, repo) => {
  // Return if comment is made on a Pull Request.
  // Comment out the following line if you want to use claim on PRs too.
  if (payload.issue.pull_request) return;

  console.log("Args:", args);

  const number = payload.issue.number;
  const commenter = payload.comment.user.login;
  const assignees = payload.issue.assignees;
  const limit = client.config.features.claim.max_assignees;

  // Check if the issue is already assigned to the commenter.
  if (assignees.find((assignee) => assignee.login === commenter)) {
    const error = "**ERROR:** You have already claimed this issue.";
    return client.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: error,
    });
  }

  // Check if assigning the issue to the commenter will exceed the limit.
  if (assignees.length >= limit) {
    const warn = client.templates
      .get("multipleClaimWarning")
      .format({ commenter });
    return client.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: warn,
    });
  }

  return addAssignee(client, commenter, number, owner, repo);
};
