import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { IssueComment } from "@octokit/webhooks-types";
import { Client } from "../types";

import { getAllPages } from "../utils";

type ListCommentsParameters =
  RestEndpointMethodTypes["issues"]["listComments"]["parameters"];

export default class Template {
  client: Client;
  name: string;
  content: string;

  constructor(client: Client, name: string, content: string) {
    /**
     * The client that instantiated this template
     */
    this.client = client;

    /**
     * The name of this template
     */
    this.name = name;

    /**
     * The content of this template
     * @type {string}
     */
    this.content = content;
  }

  /**
   * Finds comments generated from templates on a issue/pull request.
   *
   * @param {Object} repo Repository object of the PR/issue.
   * @return {Array} Array of filtered template comments from the client user.
   */

  async getComments(
    parameters: ListCommentsParameters
  ): Promise<IssueComment[]> {
    const [api, method] = ["issues", "listComments"];

    const comments: IssueComment[] = await getAllPages<
      ListCommentsParameters,
      IssueComment
    >(this.client, api, method, parameters);

    const templateComments = comments.filter((comment: IssueComment) => {
      // Use end of template comments to check if comment is from template
      const matched = comment.body.endsWith(`<!-- ${this.name} -->`);
      const fromClient = comment.user.login === this.client.username;
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
