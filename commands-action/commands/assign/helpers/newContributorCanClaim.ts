import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { Issue } from "@octokit/webhooks-types";
import { getAllPages } from "../../../../utils";
import { CommandsActionClient } from "../../../types";

type IssuesListForRepoParameters =
  RestEndpointMethodTypes["issues"]["listForRepo"]["parameters"];

export default async function newContributorCanClaim(
  client: CommandsActionClient,
  number: number,
  commenter: string,
  issueLabels: string[],
  owner: string,
  repo: string
): Promise<boolean> {
  const newContributorConfig = client.config.assign?.new_contributors;
  if (!newContributorConfig) {
    // If new_contributor config is not defined, commenter has no restriction
    // based on being a new contributor and thus, can claim the issue.
    return true;
  }

  if (newContributorConfig.assign_only_if) {
    const all_labels_absent =
      newContributorConfig.assign_only_if.all_labels_absent;
    const any_label_present =
      newContributorConfig.assign_only_if.any_label_present;

    console.log(all_labels_absent, any_label_present);

    if (!all_labels_absent && !any_label_present) {
      throw new Error(
        "Please mention atleast one of `all_labels_absent` and `any_label_absent` config."
      );
    }

    const issueLabelsRestriction1Template = client.templates.get(
      "issueLabelsRestriction1"
    );
    if (!issueLabelsRestriction1Template) {
      throw new Error("Issue labels restriction 1 template not found.");
    }

    const issueLabelsRestriction2Template = client.templates.get(
      "issueLabelsRestriction2"
    );
    if (!issueLabelsRestriction2Template) {
      throw new Error("Issue labels restriction 2 template not found.");
    }

    // `all_labels_absent` will have more precedence over `any_label_present`.
    if (all_labels_absent) {
      const labelTestPassed = all_labels_absent.every(
        (label) => !issueLabels.includes(label)
      );

      if (!labelTestPassed) {
        let restrictionMessage: string;

        // If `any_label_present` is not present in the config, use 1st template,
        // otherwise, use the 2nd template.
        if (!any_label_present) {
          restrictionMessage = issueLabelsRestriction1Template.format({
            commenter,
            atleast_one: "atleast one",
            labelList: `"${all_labels_absent.join('", "')}"`,
            none: "none",
          });
        } else {
          restrictionMessage = issueLabelsRestriction2Template.format({
            commenter,
            atleast_one: "atleast one",
            labelList1: `"${all_labels_absent.join('", "')}"`,
            none: "none",
            labelList2: `"${any_label_present.join('", "')}"`,
            without: "without",
          });
        }

        client.octokit.issues.createComment({
          owner,
          repo,
          issue_number: number,
          body: restrictionMessage,
        });

        return false;
      }
    }

    if (any_label_present) {
      const labelTestPassed = any_label_present.some((label) =>
        issueLabels.includes(label)
      );

      if (!labelTestPassed) {
        let restrictionMessage: string;

        // If `all_labels_absent` is not present in the config, use 1st template,
        // otherwise, use the 2nd template.
        if (!all_labels_absent) {
          restrictionMessage = issueLabelsRestriction1Template.format({
            commenter,
            atleast_one: "none",
            labelList: `"${any_label_present.join('", "')}"`,
            none: "alteast one",
          });
        } else {
          restrictionMessage = issueLabelsRestriction2Template.format({
            commenter,
            atleast_one: "none",
            labelList1: `"${any_label_present.join('", "')}"`,
            none: "atleast one",
            labelList2: `"${all_labels_absent.join('", "')}"`,
            without: "with",
          });
        }

        client.octokit.issues.createComment({
          owner,
          repo,
          issue_number: number,
          body: restrictionMessage,
        });

        return false;
      }
    }
  }

  if (newContributorConfig.max_issue_claims) {
    const limit = newContributorConfig.max_issue_claims;

    const assignedIssues: Issue[] = await getAllPages<
      IssuesListForRepoParameters,
      Issue
    >(client.octokit, "issues", "listForRepo", {
      owner,
      repo,
      assignee: commenter,
    });

    if (assignedIssues.length >= limit) {
      const maxIssueClaimsRestrictionTemplate = client.templates.get(
        "maxIssueClaimsRestriction"
      );
      if (!maxIssueClaimsRestrictionTemplate) {
        throw new Error("Max issue claims restriction template not found.");
      }

      const restrictionMessage = maxIssueClaimsRestrictionTemplate.format({
        commenter,
        limit,
        issue: `issue${limit === 1 ? "" : "s"}`,
      });

      client.octokit.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: restrictionMessage,
      });

      return false;
    }
  }

  return true;
}
