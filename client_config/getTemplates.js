import { getInput } from "@actions/core";
import * as fs from "fs";
import Template from "../structures/Template";

export default async function getTemplates(client, owner, repo) {
  const templatesMap = new Map();

  const defaultTemplates = fs.readdirSync(`${__dirname}/../templates`);
  const userTemplates = await getUserTemplates(client, owner, repo);

  for (const file of defaultTemplates) {
    let content;

    if (userTemplates.includes(file)) {
      content = await getUserTemplate(client, owner, repo, file);
    } else {
      content = fs.readFileSync(`${__dirname}/../templates/${file}`, "utf8");
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

  let response;

  try {
    response = await client.repos.getContent({
      owner,
      repo,
      path: templates_dir_path,
    });
  } catch (error) {
    if (error.status === 404) {
      throw new Error(
        "Templates directory not found. Please check the path in your workflow file."
      );
    } else {
      throw new Error(
        `Received unexpected API status code while requesting templates dir: ${status}`
      );
    }
  }

  const userTemplates = response.data;

  if (!Array.isArray(userTemplates)) {
    throw new Error(
      "Please provide correct templates directory path in your workflow file."
    );
  }

  const userTemplatesNameArray = userTemplates
    .filter((template) => template.type === "file")
    .map((template) => template.name);

  return userTemplatesNameArray;
};

const getUserTemplate = async (client, owner, repo, templateName) => {
  const templates_dir_path = getInput("templates-dir-path");
  const template_file_path = templates_dir_path + "/" + templateName;

  let response;

  try {
    response = await client.repos.getContent({
      owner,
      repo,
      path: template_file_path,
    });
  } catch (error) {
    if (error.status === 404) {
      throw new Error(`Template file ${templateName} not found.`);
    } else {
      throw new Error(
        `Received unexpected API status code while requesting ${templateName} template: ${status}`
      );
    }
  }
  const template_data_encoded = response.data.content;

  if (!template_data_encoded) {
    throw new Error(
      `Unable to read the contents of the template ${templateName}.`
    );
  }

  const template_data = Buffer.from(template_data_encoded, "base64").toString(
    "utf-8"
  );
  return template_data;
};
