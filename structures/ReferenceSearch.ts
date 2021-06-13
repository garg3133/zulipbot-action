import { OctokitClient } from "../client/octokit";
import { PullRequest } from "@octokit/webhooks-types";

/* eslint-disable array-element-newline */

const keywords: string[] = [
  "close",
  "closes",
  "closed",
  "fix",
  "fixes",
  "fixed",
  "resolve",
  "resolves",
  "resolved",
];

/* eslint-enable array-element-newline */

export default class ReferenceSearch {
  octokit: OctokitClient;
  number: number;
  body: string | null;
  repoOwner: string;
  repoName: string;

  constructor(
    octokit: OctokitClient,
    pull: PullRequest,
    owner: string,
    repo: string
  ) {
    this.octokit = octokit;
    this.number = pull.number;
    this.body = pull.body;
    this.repoName = repo;
    this.repoOwner = owner;
  }

  /**
   * Finds all open referenced issues from a given string
   * by identifying keywords specified above.
   *
   * Keywords are sourced from
   * https://help.github.com/articles/closing-issues-using-keywords/
   *
   * Issues referenced in PR description are closed when the pull request
   * is merged, and issues referenced in commit message are closed when
   * the commit is merged into the default branch, irrespective of whether
   * the pull request containing the commit is merged or not.
   *
   * @param {Array} strings Strings to find issue references in.
   * @return {Array} Sorted array of all referenced issue numbers.
   */

  async find(strings: string[]): Promise<number[]> {
    let matches: (string | null)[] = [];

    strings.forEach((string) => {
      const wordMatches: (string | null)[] = keywords.map((tense) => {
        const regex = new RegExp(`${tense}:? +#([0-9]+)`, "i");
        const match = string.match(regex);
        return match ? match[1] : match;
      });
      matches = matches.concat(wordMatches);
    });

    // Check matches for valid issue references
    const statusCheck: Promise<number | false>[] = matches.map(
      async (match) => {
        if (!match) return false;
        const number = parseInt(match);

        const issue = await this.octokit.issues.get({
          owner: this.repoOwner,
          repo: this.repoName,
          issue_number: number,
        });

        // Valid references are open issues
        const valid = !issue.data.pull_request && issue.data.state === "open";
        return valid ? number : false;
      }
    );

    // statusCheck is an array of promises, so use Promise.all
    const matchStatuses: (number | false)[] = await Promise.all(statusCheck);
    // Filter out to issue_numbers only
    const references: number[] = matchStatuses.filter(
      (x): x is number => typeof x === "number"
    );
    console.log("Referenced issues: ", references);

    return references;
  }

  async getBody(): Promise<number[]> {
    if (!this.body) return [];

    const bodyRefs = await this.find([this.body]);
    return bodyRefs;
  }

  async getCommits(): Promise<number[]> {
    const commits = await this.octokit.pulls.listCommits({
      owner: this.repoOwner,
      repo: this.repoName,
      pull_number: this.number,
    });

    const commitMsgs = commits.data.map((c) => c.commit.message);
    console.log("Commit messages:", commitMsgs);
    const commitRefs = await this.find(commitMsgs);

    return commitRefs;
  }
}
