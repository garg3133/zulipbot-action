export default async function scrapeInactiveIssues(
  client,
  references,
  issues,
  owner,
  repo
) {
  const warn_ms = (client.config.days_until_warning * 86400000) / 24;
  const abandon_ms = (client.config.days_until_unassign * 86400000) / 24;
  console.log("Warn ms:", warn_ms);
  console.log("Abandon ms:", abandon_ms);

  for (const issue of issues) {
    const isPR = issue.pull_request;
    if (isPR) continue;

    const skip_issue = issue.labels.find((label) => {
      return label.name === client.config.skip_issue_with_label;
    });
    if (skip_issue) continue;

    let time = Date.parse(issue.updated_at);
    const number = issue.number;
    const issueTag = `${repo}/${number}`;

    // Update `time` to the latest activity on issue or linked PRs.
    if (time < references.get(issueTag)) time = references.get(issueTag);

    // Use `abandon_ms` as warning comment on the issue also
    // updates the issue.
    if (time + abandon_ms > Date.now()) continue;

    // `abandon_ms` time has passed since the last update...

    const inactiveWarningTemplate = client.templates.get("inactiveWarning");

    const commentsByTemplate = await inactiveWarningTemplate.getComments({
      owner,
      repo,
      issue_number: number,
    });

    const relevantWarningComment = commentsByTemplate.find((comment) => {
      // No progress was made after warning comment.
      const comment_ms = Date.parse(comment.created_at);

      // Check for (+)(-)2sec as sometimes comment_ms may differ from
      // issue last updated time by a sec or so.
      return comment_ms >= time - 2000 && comment_ms <= time + 2000;
    });

    console.log("\nCurrently on issue:", number);
    console.log("Comments posted by activity action:", commentsByTemplate);
    console.log("Relevant comment:", relevantWarningComment);
    console.log("Issue last updated at: ", time, issue.updated_at);

    if (relevantWarningComment) {
      console.log(
        "Warning time: ",
        Date.parse(relevantWarningComment.created_at)
      );
      // `abandon_ms` time has passed after the last update and
      // the last update was the warning given by the action.
      const assignees = issue.assignees.map((assignee) => assignee.login);

      client.issues.removeAssignees({
        owner,
        repo,
        issue_number: number,
        assignees: assignees,
      });

      const abandonWarning = client.templates.get("abandonWarning").format({
        assignee: assignees.join(", @"),
        total: (abandon_ms + warn_ms) / 86400000,
        username: client.username,
      });

      const id = relevantWarningComment.id;
      client.issues.updateComment({
        owner,
        repo,
        comment_id: id,
        body: abandonWarning,
      });
    } else if (time + warn_ms <= Date.now()) {
      // `warn_ms` time as passed since the last update.
      const assignees = issue.assignees.map((assignee) => assignee.login);

      const inactiveWarning = inactiveWarningTemplate.format({
        assignee: assignees.join(", @"),
        remind: client.config.days_until_warning,
        abandon: client.config.days_until_unassign,
        username: client.username,
      });

      client.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: inactiveWarning,
      });
    }
  }
}
