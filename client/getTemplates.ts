import { getInput } from "@actions/core";
import Template from "../structures/Template";
import * as fs from "fs";

import { OctokitClient } from "../types";

export default async function getTemplates(
  octokit: OctokitClient,
  owner: string,
  repo: string
): Promise<Map<string, Template>> {
  const templatesMap: Map<string, Template> = new Map();

  const defaultTemplates: string[] = fs.readdirSync(
    `${__dirname}/../templates`
  );
  const userTemplates: string[] = await getUserTemplates(octokit, owner, repo);

  for (const file of defaultTemplates) {
    let content: string;

    if (userTemplates.includes(file)) {
      content = await getUserTemplate(octokit, owner, repo, file);
    } else {
      content = fs.readFileSync(`${__dirname}/../templates/${file}`, "utf8");
    }

    const [name] = file.split(".md");
    const template = new Template(octokit, name, content);
    templatesMap.set(name, template);
  }

  return templatesMap;
}

const getUserTemplates = async (
  octokit: OctokitClient,
  owner: string,
  repo: string
): Promise<string[]> => {
  const templatesDirPath: string = getInput("templates-dir-path");
  if (!templatesDirPath) return [];

  let userTemplatesNameArray: string[] | undefined;

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: templatesDirPath,
    });

    if (Array.isArray(data)) {
      userTemplatesNameArray = data
        .filter((template) => template.type === "file")
        .map((template) => template.name);
    }
  } catch (error) {
    if (error.status === 404) {
      throw new Error(
        "Templates directory not found. Please check the path in your workflow file."
      );
    } else {
      throw new Error(
        `Received unexpected API status code while requesting templates dir: ${error.status}`
      );
    }
  }

  if (userTemplatesNameArray === undefined) {
    // If templatesDirPath is not a path to a directory
    // => `data` will be an object and not an array
    // => userTemplatesNameArray will be undefined.
    throw new Error(
      "Please provide correct templates directory path in your workflow file."
    );
  }

  return userTemplatesNameArray;
};

const getUserTemplate = async (
  octokit: OctokitClient,
  owner: string,
  repo: string,
  templateName: string
): Promise<string> => {
  const templatesDirPath: string = getInput("templates-dir-path");
  const templateFilePath = templatesDirPath + "/" + templateName;

  let templateDataEncoded: string | undefined;

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: templateFilePath,
    });

    if ("content" in data) {
      templateDataEncoded = data.content;
    }
  } catch (error) {
    if (error.status === 404) {
      throw new Error(`Template file ${templateName} not found.`);
    } else {
      throw new Error(
        `Received unexpected API status code while requesting ${templateName} template: ${error.status}`
      );
    }
  }

  if (!templateDataEncoded) {
    throw new Error(
      `Unable to read the contents of the template ${templateName}.`
    );
  }

  const templateData = Buffer.from(templateDataEncoded, "base64").toString(
    "utf-8"
  );
  return templateData;
};
