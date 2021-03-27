import Search from "../structures/ReferenceSearch";
import scrapeInactiveIssues from "./scrapeInactiveIssues";
import * as utils from "./utils";

export default async function scrapePulls(client, pulls, owner, repo) {
  // Check all open Pull Requests and their commits and add to
  // `referenceList` the issue linked with the PR/commit as key
  // and the time the PR was last updated as value.
  const referenceList = new Map();

  for (const pull of pulls) {
    let time = Date.parse(pull.updated_at);
    const number = pull.number;

    if (client.config.skip_issue_with_pull_label) {
      // Set time = Date.now() for the PR if it contains this
      // label so that the linked issue gets skipped
      // automatically.
      console.log("hello");
      const skip_linked_issue = pull.labels.find((label) => {
        return label.name === client.config.skip_issue_with_pull_label;
      });

      if (skip_linked_issue) time = Date.now();
      console.log(skip_linked_issue);
    }

    // Find all the linked issues to the PR and its commits.
    const references = new Search(client, pull, pull.base.repo);
    const bodyRefs = await references.getBody();
    const commitRefs = await references.getCommits();

    if (bodyRefs.length || commitRefs.length) {
      const references = commitRefs.concat(bodyRefs);
      // sort and remove duplicate references
      const refs = Array.from(new Set(references)).sort();
      refs.forEach((ref) => {
        const issue_tag = `${repo}/${ref}`;
        if (referenceList.has(issue_tag)) {
          // compare time and add the most latest time.
          const setTime = referenceList.get(issue_tag);
          if (time > setTime) referenceList.set(issue_tag, time);
        } else {
          referenceList.set(issue_tag, time);
        }
      });
    }
  }
  // Pulls scraping complete
  // referenceList now contains all the issues having an open
  // linked PR with the time at which its most acive was last
  // updated.

  for (const [key, value] of referenceList) {
    console.log(key, value);
  }
  // Bring in all open and assigned issues.
  const issues = await utils.getAllPages(client, "issues.listForRepo", {
    owner,
    repo,
    assignee: "*",
  });

  await scrapeInactiveIssues(client, referenceList, issues, owner, repo);
}
