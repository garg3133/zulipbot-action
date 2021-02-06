const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
    // Get octokit
    const gitHubToken = core.getInput('repo-token', { required: true });
    const client = github.getOctokit(gitHubToken);

    // Get issue and pr message
    const issueMessage = core.getInput('issue-message');
    const prMessage = core.getInput('pr-message');

    if (!issueMessage && !prMessage) {
        throw new Error(
          'Action must have at least one of issue-message or pr-message set'
        );
    }

    const context = github.context;
    // Do nothing if `action` is not `opened`.
    if (context.payload.action !== 'opened') {
        console.log('No issue or PR was opened, skipping');
        return;
    }

    // Do nothing if its not a pr or issue
    const isIssue = !!context.payload.issue;
    if (!isIssue && !context.payload.pull_request) {
      console.log(
        'The event that triggered this action was not a pull request or issue, skipping.'
      );
      return;
    }

    // Do nothing if no message set for this type of contribution
    const message = isIssue ? issueMessage : prMessage;
    if (!message) {
        console.log('No message provided for this type of contribution');
        return;
    }


    // Get sender, repo and issue/pr info
    if (!context.payload.sender) {
      throw new Error('Internal error, no sender provided by GitHub');
    }
    const sender = context.payload.sender.login;

    // Both issue and pr_number (or payload number, as applicable)
    // can be found  in `context.issue`.
    const {owner, repo, number} = context.issue;


    // Do nothing if its not their first contribution
    console.log('Checking if its the users first contribution');

    let firstContribution = true;
    // if (isIssue) {
    //   firstContribution = await isFirstIssue(
    //     client,
    //     owner,
    //     repo,
    //     sender,
    //     number
    //   );
    // } else {
    //   firstContribution = await isFirstPull(
    //     client,
    //     owner,
    //     repo,
    //     sender,
    //     number
    //   );
    // }
    if (!firstContribution) {
      console.log('Not the users first contribution');
      return;
    }


    // To create a comment on a pull request, we hit the issue endpoint only.
    // See: https://octokit.github.io/rest.js/v18#pulls-create-review-comment
    // 
    // So, from here, both issue and pull will be considered as `issue`.

    const issueType = isIssue ? 'issue' : 'pull request';
    // Add a comment to the appropriate place
    console.log(`Adding message: ${message} to ${issueType} ${number}`);

    // Add comment (greeting) to issue/PR
    try {
        await client.issues.createComment({
            owner,
            repo,
            issue_number: number,
            body: message
        });
    } catch (error) {
        core.setFailed(error.message);
    }
};




// Run the script
try {
    run();
} catch (error) {
    core.setFailed(error.message);
}