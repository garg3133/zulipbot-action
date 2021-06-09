import * as utils from "../../utils";
import Search from "../../structures/ReferenceSearch";
import scrapeInactiveIssues from "./scrapeInactiveIssues";

import { ActivityActionClient } from "../types";
import { Issue, PullRequest } from "@octokit/webhooks-types";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type IssuesListForRepoParameters =
  RestEndpointMethodTypes["issues"]["listForRepo"]["parameters"];

export default async function scrapePulls(
  client: ActivityActionClient,
  pulls: PullRequest[],
  owner: string,
  repo: string
): Promise<void> {
  // Check all open Pull Requests and their commits and add the
  // issues linked with PR/commits to `referenceList` as keys
  // and the time the PR was last updated as value.
  const referenceList: Map<number, number> = new Map();

  for (const pull of pulls) {
    let time = Date.parse(pull.updated_at);
    const number = pull.number;

    console.log("Currently on PR: ", number);

    if (client.config.skip_issue_with_pull_label) {
      // Set time = Date.now() for the PR if it contains this
      // label so that the linked issue gets skipped
      // automatically.
      console.log("Inside skip issue with pull label");
      const skip_linked_issue = pull.labels.find((label) => {
        return label.name === client.config.skip_issue_with_pull_label;
      });

      if (skip_linked_issue) time = Date.now();
      console.log("Pull Label for skipping issue:", skip_linked_issue);
    }

    // Find all the linked issues to the PR and its commits.
    const referenceSearch = new Search(client.octokit, pull, owner, repo);
    const bodyRefs = await referenceSearch.getBody();
    const commitRefs = await referenceSearch.getCommits();

    if (bodyRefs.length || commitRefs.length) {
      const refs = commitRefs.concat(bodyRefs);

      // sort and remove duplicate references
      const references = utils.deduplicate<number>(refs);

      references.forEach((issue_number) => {
        const alreadySetTime = referenceList.get(issue_number);
        if (alreadySetTime) {
          // compare time and add the most latest time.
          if (time > alreadySetTime) referenceList.set(issue_number, time);
        } else {
          referenceList.set(issue_number, time);
        }
      });
    }
  }
  // Pulls scraping complete
  // referenceList now contains all the issues having an open
  // linked PR with the time at which its most acive was last
  // updated.

  console.log("All issue references found...");
  for (const [key, value] of referenceList) {
    console.log(key, value);
  }
  // Bring in all open and assigned issues.
  const [api, method] = ["issues", "listForRepo"];
  const parameters: IssuesListForRepoParameters = {
    owner,
    repo,
    assignee: "*",
  };

  const issues: Issue[] = await utils.getAllPages<
    IssuesListForRepoParameters,
    Issue
  >(client.octokit, api, method, parameters);

  await scrapeInactiveIssues(client, referenceList, issues, owner, repo);
}
