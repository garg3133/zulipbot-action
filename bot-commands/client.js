const core = require('@actions/core');
const github = require('@actions/github');
const fs = require("fs");

const cfg = require('./config.js');

// Get octokit
const token = core.getInput('token', { required: true });
const client = github.getOctokit('', {auth: token});

client.cfg = cfg;
client.commands = new Map();

const commands = fs.readdirSync(`${__dirname}/commands`);
for (const file of commands) {
    const [fileName] = file.split(".");
    const data = require(`./commands/${file}`);
    client.commands.set(fileName, data);
}

module.exports = client;
