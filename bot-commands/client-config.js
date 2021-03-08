const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');
const fs = require("fs");

exports.getClient = async () => {
  // Get octokit
  const token = core.getInput('token', { required: true });
  const client = github.getOctokit('', {auth: token});

  // Get bot's username
  const {status, data: {login: botUsername}} = await client.users.getAuthenticated();
  if (status !== 200) {
    throw new Error(`Received unexpected API status code ${status} while looking for bot's username.`);
  }
  client.username = botUsername;

  // Get bot's configuration
  const {owner, repo} = github.context.issue;
  client.config = await getBotConfig(client, owner, repo);

  // Set bot's commands
  client.commands = new Map();
  const commands = fs.readdirSync(`${__dirname}/commands`);
  for (const file of commands) {
    const data = require(`./commands/${file}`);
    const [category, name] = data.aliasPath.split(".");
    const aliases = client.config[category][name];
    // if (!aliases) continue;
    for (let i = aliases.length; i--;) {
      client.commands.set(aliases[i], data);
    }
  }

  // Set bot's templates
  client.templates = new Map();
  const Template = require("./structures/Template.js");
  const templates = fs.readdirSync(`${__dirname}/config/templates`);
  const userTemplates = await getUserTemplates(client, owner, repo);
  for (const file of templates) {
    let content;
    if (userTemplates.includes(file)) {
      content = await getUserTemplate(client, owner, repo, file);
    } else {
      content = fs.readFileSync(`${__dirname}/templates/${file}`, "utf8");
    }
    const [name] = file.split(".md");
    const template = new Template(client, name, content);
    client.templates.set(name, template);
  }

  return client;
}

const getBotConfig = async (client, owner, repo) => {
  const config_file_path = core.getInput('config-file-path');

  const {status, data: {content: config_data_encoded}} = await client.repos.getContent({
    owner,
    repo,
    path: config_file_path
  });

  if (status !== 200) {
    throw new Error(`Received unexpected API status code while requsting config ${status}`);
  }

  const config_data = Buffer.from(config_data_encoded, 'base64').toString('utf-8');
  const config_data_json = JSON.parse(config_data);

  const default_config = yaml.load(fs.readFileSync(`${__dirname}/config/default-config.yaml`, 'utf8'));
  console.log(default_config, typeof default_config);

  return config_data_json;
}

const getUserTemplates = async (client, owner, repo) => {
  const templates_dir_path = core.getInput('templates-dir-path');

  if (!templates_dir_path) return [];

  const {status, data: userTemplates} = await client.repos.getContent({
    owner,
    repo,
    path: templates_dir_path
  });

  if (status !== 200) {
    throw new Error(`Received unexpected API status code while requsting templates ${status}`);
  }

  const userTemplatesNameArray = userTemplates.map(template => template.name);

  return userTemplatesNameArray;
}

const getUserTemplate = async (client, owner, repo, templateName) => {
  const templates_dir_path = core.getInput('templates-dir-path');

  if (!templates_dir_path) return "";

  const template_file_path = templates_dir_path + '/' + templateName;

  const {status, data: {content: template_data_encoded}} = await client.repos.getContent({
    owner,
    repo,
    path: template_file_path
  });

  if (status !== 200) {
    throw new Error(`Received unexpected API status code while requsting template ${status}`);
  }

  const template_data = Buffer.from(template_data_encoded, 'base64').toString('utf-8');

  return template_data;
}
