import { setFailed } from "@actions/core";
import { getAllPages } from "../../../utils";
import addAssignee from "./helpers/addAssignee";
import inviteAsCollaborator from "./helpers/inviteAsCollaborator";
import newContributorCanClaim from "./helpers/newContributorCanClaim";

import { IssueCommentCreatedEvent } from "@octokit/webhooks-types";
import { CommandsActionClient } from "../../types";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type ListContributorsParameters =
  RestEndpointMethodTypes["repos"]["listContributors"]["parameters"];
type ListContributorsResponse =
  RestEndpointMethodTypes["repos"]["listContributors"]["response"]["data"][0];

export const run = async (
  client: CommandsActionClient,
  payload: IssueCommentCreatedEvent,
  args: string,
  owner: string,
  repo: string
): Promise<void> => {
  // Return if comment is made on a Pull Request.
  // Comment out the following line if you want to use the
  // assign feature on PRs too.
  if (payload.issue.pull_request) return;

  if (!client.config.assign) return;

  const number: number = payload.issue.number;
  const commenter: string = payload.comment.user.login;
  const assignees: string[] = payload.issue.assignees.map(
    (assignee) => assignee.login
  );
  const issueLabels = payload.issue.labels.map((label) => label.name);
  const limit: number = client.config.assign.max_assignees ?? 1;

  // Check if the issue is already assigned to the commenter.
  if (assignees.includes(commenter)) {
    const error: string = "**ERROR:** You have already claimed this issue.";
    await client.octokit.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: error,
    });
    return;
  }

  // Check if assigning the issue to the commenter will exceed the limit.
  if (assignees.length >= limit) {
    const multipleClaimWarningTemplate = client.templates.get(
      "multipleClaimWarning"
    );
    if (multipleClaimWarningTemplate) {
      const warn = multipleClaimWarningTemplate.format({ commenter });

      await client.octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: warn,
      });
    }
    return;
  }

  const isOrg = payload.repository.owner.type === "Organization";

  if (isOrg && client.config.assign.add_as_collaborator) {
    try {
      await client.octokit.repos.checkCollaborator({
        owner,
        repo,
        username: commenter,
      });
    } catch (error) {
      if (error.status !== 404) {
        setFailed(
          "Unexpected response from GitHub API while checking if the commenter is a collaborator on the repository."
        );
      }
      return inviteAsCollaborator(client, number, commenter, owner, repo);
    }
  }

  if (client.config.assign.new_contributors) {
    const contributors: ListContributorsResponse[] = await getAllPages<
      ListContributorsParameters,
      ListContributorsResponse
    >(client.octokit, "repos", "listContributors", {
      owner,
      repo,
    });

    if (!contributors.find((user) => user.login === commenter)) {
      // Commenter is a new contributor
      const canClaim = await newContributorCanClaim(
        client,
        number,
        commenter,
        issueLabels,
        owner,
        repo
      );

      if (!canClaim) return;
    }
  }

  await addAssignee(client, commenter, number, owner, repo);
};
