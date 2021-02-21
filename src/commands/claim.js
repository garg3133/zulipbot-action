exports.run = async function(payload, commenter, args) {
    const repoName = payload.repository.name;
    const repoOwner = payload.repository.owner.login;
    const number = payload.issue.number;
  
    if (payload.issue.assignees.find(assignee => assignee.login === commenter)) {
      const error = "**ERROR:** You have already claimed this issue.";
      return this.issues.createComment({
        owner: repoOwner, repo: repoName, issue_number: number, body: error
      });
    }

    claim.apply(this, [commenter, number, repoOwner, repoName]);
}

async function claim(commenter, number, repoOwner, repoName) {
    const response = await this.issues.addAssignees({
      owner: repoOwner, repo: repoName, issue_number: number, assignees: [commenter]
    });
  
    if (response.data.assignees.length) return;
  
    const error = "**ERROR:** Issue claiming failed (no assignee was added).";
  
    return this.issues.createComment({
      owner: repoOwner, repo: repoName, issue_number: number, body: error
    });
}