const core = require('@actions/core');
const github = require('@actions/github');
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

    // Get user configuration
    const {owner, repo} = github.context.issue;
    client.config = await getUserConfig(client, owner, repo);

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

    return client;
}

const getUserConfig = async (client, owner, repo) => {
    config_file_path = core.getInput('config-path');

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

    return config_data_json;
}