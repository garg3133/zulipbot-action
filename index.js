const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
    // Get octokit
    const gitHubToken = core.getInput('repo-token', { required: true });
    const octokit = github.getOctokit(gitHubToken);

    // Get repo and issue info
    const { repository, issue } = github.context.payload;
    if (!issue) {
        throw new Error(`Couldn't find issue info in current context`);
    }
    const [owner, repo] = repository.full_name.split('/');
    console.log(owner, repo);
    // Get issue body
    const body = core.getInput('body', { required: true });
    console.log(body);
    // Create issue comment

    try {
        await octokit.issues.createComment({
            owner,
            repo,
            issue_number: issue.number,
            body: body,
        });
    } catch (error) {
        core.debug("errorrr");
        core.setFailed(error.message);
    }
};

try {
    run();
} catch (error) {
    core.setFailed(error.message);
}