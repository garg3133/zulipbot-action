const client = require("./client.js")
const core = require('@actions/core');
const github = require('@actions/github');

const run = async () => {
    // Get the bot's username
    const {status, data: {login: botName}} = await client.users.getAuthenticated();
    if (status !== 200) {
        throw new Error(`Received unexpected API status code ${status} while looking for bot's username.`);
    }
    client.cfg.botName = botName;

    // Create a config file

    const context = github.context;

    const eventHandler = client.events.get(context.eventName);
    if (!eventHandler) return;

    const payload = context.payload;
    eventHandler(payload);
};


// Run the script
try {
    run();
} catch (error) {
    core.setFailed(error.message);
}