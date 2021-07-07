import { getAllPages } from "../../../utils";

import { User } from "@octokit/webhooks-types";
import { CommandsActionClient } from "../../types";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type OrgListMembersParameters =
  RestEndpointMethodTypes["orgs"]["listMembers"]["parameters"];

export default async function isCommenterPermitted(
  client: CommandsActionClient,
  permittedToLabel: string[],
  commenter: string,
  author: string,
  isOrg: boolean,
  owner: string
): Promise<boolean> {
  if (permittedToLabel.includes("all")) return true;
  else if (permittedToLabel.includes("author") && author === commenter)
    return true;
  else if (permittedToLabel.includes(`@${commenter}`)) return true;
  else if (permittedToLabel.includes("member") && isOrg) {
    const orgMembers: User[] = await getAllPages<
      OrgListMembersParameters,
      User
    >(client.octokit, "orgs", "listMembers", {
      org: owner,
    });

    const isMember = orgMembers
      .map((member) => member.login)
      .find((member) => member == commenter);

    if (isMember) return true;
  }

  return false;
}
