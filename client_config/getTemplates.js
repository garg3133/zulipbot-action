import { getInput } from "@actions/core";
import * as fs from "fs";
import Template from "../structures/Template";

export default async function getTemplates(actionName, client, owner, repo) {
  const templatesMap = new Map();
  const defaultTemplates = fs.readdirSync(
    `${__dirname}/../${actionName}/templates`
  );
  const userTemplates = await getUserTemplates(client, owner, repo);
  for (const file of defaultTemplates) {
    let content;
    if (userTemplates.includes(file)) {
      content = await getUserTemplate(client, owner, repo, file);
    } else {
      content = fs.readFileSync(
        `${__dirname}/../${actionName}/templates/${file}`,
        "utf8"
      );
    }
    const [name] = file.split(".md");
    const template = new Template(client, name, content);
    templatesMap.set(name, template);
  }

  return templatesMap;
}

const getUserTemplates = async (client, owner, repo) => {
  const templates_dir_path = getInput("templates-dir-path");
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
  const templates_dir_path = getInput("templates-dir-path");
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
