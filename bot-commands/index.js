const client = require("./client.js");
const core = require('@actions/core');
const github = require('@actions/github');

const config = require("./config.js");

const run = async () => {
    // Get the bot's username
    const {status, data: {login: botUsername}} = await client.users.getAuthenticated();
    if (status !== 200) {
        throw new Error(`Received unexpected API status code ${status} while looking for bot's username.`);
    }
    client.username = botUsername;

    const context = github.context;
    if (context.eventName !== "issue_comment") return;

    // Get action's configuration
    const {owner, repo} = context.issue;
    try{
        client.config = await config.getConfig(client, owner, repo);
    } catch (error) {
        core.setFailed(error.message);
    }

    const payload = context.payload;
    if (payload.action === "created") {
        parse_comment(payload);
    }
};

function parse_comment(payload) {
    const data = payload.comment;
    const commenter = data.user.login;
    const body = data.body;
    const username = client.username;

    if (commenter === username || !body) return;

    const prefix = RegExp(`@${username} +(\\w+)( +(--\\w+|"[^"]+"))*`, "g");
    const parsed = body.match(prefix);
    if (!parsed) return;

    parsed.forEach(command => {
        const codeBlocks = [`\`\`\`\r\n${command}\r\n\`\`\``, `\`${command}\``];
        if (codeBlocks.some(block => body.includes(block))) return;
        const [, keyword] = command.replace(/\s+/, " ").split(" ");
        const args = command.replace(/\s+/, " ").split(" ").slice(2).join(" ");
        const file = client.commands.get(keyword);
    
        if (file) {
            file.run.apply(client, [payload, commenter, args]);
        }
    });
}


// Run the script
try {
    run();
} catch (error) {
    core.setFailed(error.message);
}