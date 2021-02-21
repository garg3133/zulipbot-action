const core = require('@actions/core');
const github = require('@actions/github');
const fs = require("fs");

const cfg = require('./config.js');

// Get octokit
const token = core.getInput('token', { required: true });
const client = github.getOctokit('', {auth: token});

client.cfg = cfg;
client.commands = new Map();
client.events = new Map();

const commands = fs.readdirSync(`${__dirname}/commands`);
for (const file of commands) {
    const [fileName] = file.split(".");
    const data = require(`./commands/${file}`);
    client.commands.set(fileName, data);
}

const events = fs.readdirSync(`${__dirname}/events`);
for (const event of events) {
    if (!event.includes(".")) continue;
    [event] = event.split(".");
    const data = require(`./events/${event}`);
    client.events.set(event, data.run.bind(client));
    client.cfg.set(event, data.getConfig);
}

module.exports = client;
