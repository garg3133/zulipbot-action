import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";
import Template from "./structures/Template";

export const getClient = async () => {
  // Get octokit
  const token = core.getInput("token", { required: true });
  const client = github.getOctokit("", { auth: token });

  // Get bot's username
  const {
    status,
    data: { login: botUsername },
  } = await client.users.getAuthenticated();
  if (status !== 200) {
    throw new Error(
      `Received unexpected API status code ${status} while looking for bot's username.`
    );
  }
  client.username = botUsername;

  const { owner, repo } = github.context.issue;

  // Get all inputs
  client.config = new Object();

  client.config.issue_assigned_label = core.getInput("issue_assigned_label");
  client.config.skip_issue_with_label = core.getInput("skip_issue_with_label");
  client.config.skip_issue_with_pull_label = core.getInput(
    "skip_issue_with_pull_label"
  );
  client.config.clear_closed_issue =
    core.getInput("clear_closed_issue") === "true";
  client.config.days_until_warning = parseInt(
    core.getInput("days_until_warning", { required: true })
  );
  client.config.days_until_unassign = parseInt(
    core.getInput("days_until_unassign", { required: true })
  );
  client.config.assign_pull_to_reviewer =
    core.getInput("assign_pull_to_reviewer") === "true";

  console.log(client.config);

  // Set bot's templates
  client.templates = new Map();
  const templates = fs.readdirSync(`${__dirname}/config/templates`);
  const userTemplates = await getUserTemplates(client, owner, repo);
  for (const file of templates) {
    let content;
    if (userTemplates.includes(file)) {
      content = await getUserTemplate(client, owner, repo, file);
    } else {
      content = fs.readFileSync(
        `${__dirname}/config/templates/${file}`,
        "utf8"
      );
    }
    const [name] = file.split(".md");
    const template = new Template(client, name, content);
    client.templates.set(name, template);
  }

  return client;
};

const getUserTemplates = async (client, owner, repo) => {
  const templates_dir_path = core.getInput("templates-dir-path");
  if (!templates_dir_path) return [];

  const { status, data: userTemplates } = await client.repos.getContent({
    owner,
    repo,
    path: templates_dir_path,
  });
  if (status !== 200) {
    throw new Error(
      `Received unexpected API status code while requsting templates ${status}`
    );
  }

  const userTemplatesNameArray = userTemplates.map((template) => template.name);
  return userTemplatesNameArray;
};

const getUserTemplate = async (client, owner, repo, templateName) => {
  const templates_dir_path = core.getInput("templates-dir-path");
  if (!templates_dir_path) return "";

  const template_file_path = templates_dir_path + "/" + templateName;

  const {
    status,
    data: { content: template_data_encoded },
  } = await client.repos.getContent({
    owner,
    repo,
    path: template_file_path,
  });
  if (status !== 200) {
    throw new Error(
      `Received unexpected API status code while requsting template ${status}`
    );
  }

  const template_data = Buffer.from(template_data_encoded, "base64").toString(
    "utf-8"
  );
  return template_data;
};
