const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require("js-yaml");

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

  // Get action's configuration
  const {owner, repo} = github.context.issue;
  client.config = await getActionConfig(client, owner, repo);

  return client;
}

const getActionConfig = async (client, owner, repo) => {
  const config_file_path = core.getInput('config-file-path');

  const {status, data: {content: config_data_encoded}} = await client.repos.getContent({
    owner,
    repo,
    path: config_file_path
  });

  if (status !== 200) {
    throw new Error(`Received unexpected API status code while requsting config ${status}`);
  }

  const config_data_string = Buffer.from(config_data_encoded, 'base64').toString('utf-8');
  const config_data = yaml.load(config_data_string);

  return config_data;
}
