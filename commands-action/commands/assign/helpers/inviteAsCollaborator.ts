import { getAllPages } from "../../../../utils";

import { CommandsActionClient } from "../../../types";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type ListInvitationsParameters =
  RestEndpointMethodTypes["repos"]["listInvitations"]["parameters"];
type ListInvitationsResponse =
  RestEndpointMethodTypes["repos"]["listInvitations"]["response"]["data"][0];

export default async function inviteAsCollaborator(
  client: CommandsActionClient,
  number: number,
  commenter: string,
  owner: string,
  repo: string
): Promise<void> {
  const [api, method] = ["repos", "listInvitations"];
  const parameters: ListInvitationsParameters = {
    owner,
    repo,
  };

  const openInvitations: ListInvitationsResponse[] = await getAllPages<
    ListInvitationsParameters,
    ListInvitationsResponse
  >(client.octokit, api, method, parameters);

  const activeInviteToCommenter = openInvitations.find((invitation) => {
    return (
      invitation.invitee?.login === commenter && invitation.expired === false
    );
  });

  if (activeInviteToCommenter !== undefined) {
    const inviteErrorTemplate = client.templates.get("inviteError");
    if (!inviteErrorTemplate) {
      throw new Error("Invite error template not found.");
    }

    const inviteError = inviteErrorTemplate.format({
      commenter,
      owner,
      repo,
    });

    client.octokit.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: inviteError,
    });
    return;
  }

  const contributorAdditionTemplate = client.templates.get(
    "contributorAddition"
  );
  if (!contributorAdditionTemplate) {
    throw new Error("Contributor Addition template not found.");
  }

  const contributorAdditionMessage = contributorAdditionTemplate.format({
    commenter,
    owner,
    repo,
    bot_username: client.username,
  });

  client.octokit.repos.addCollaborator({
    owner,
    repo,
    username: commenter,
    permission: "pull",
  });

  client.octokit.issues.createComment({
    owner,
    repo,
    issue_number: number,
    body: contributorAdditionMessage,
  });
}
