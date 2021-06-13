import { getOctokitLogin } from "../client/octokit";
import { getAllPages } from "../utils";

import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { IssueComment } from "@octokit/webhooks-types";
import { OctokitClient } from "../client/octokit";

type ListCommentsParameters =
  RestEndpointMethodTypes["issues"]["listComments"]["parameters"];

export default class Template {
  octokit: OctokitClient;
  name: string;
  content: string;

  constructor(octokit: OctokitClient, name: string, content: string) {
    this.octokit = octokit;
    this.name = name;
    this.content = content;
  }

  /**
   * Finds comments generated from templates on a issue/pull request.
   *
   * @param {Object} parameters Parameters to be passed to issues.listComments.
   * @return {Array} Array of filtered template comments from the octokit user.
   */

  async getComments(
    parameters: ListCommentsParameters
  ): Promise<IssueComment[]> {
    const [api, method] = ["issues", "listComments"];
    const clientUsername = await getOctokitLogin(this.octokit);

    const comments: IssueComment[] = await getAllPages<
      ListCommentsParameters,
      IssueComment
    >(this.octokit, api, method, parameters);

    const templateComments = comments.filter((comment: IssueComment) => {
      // Use end of template comments to check if comment is from template
      const matched = comment.body.endsWith(`<!-- ${this.name} -->`);
      const fromClient = comment.user.login === clientUsername;
      return matched && fromClient;
    });

    return templateComments;
  }

  /**
   * Formats template content with values from a given context.
   *
   * @param {Object} context Context with names/values of variables to format
   * @return {String} Formatted template content.
   */

  format(context: { [key: string]: string | number }): string {
    let content = this.content;

    for (const [expression, value] of Object.entries(context)) {
      content = content.replace(
        new RegExp(`{${expression}}`, "g"),
        value.toString()
      );
    }

    return content;
  }
}
