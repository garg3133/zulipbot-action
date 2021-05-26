import * as claim from "./claim/claim";

export default function getBotCommands() {
    const commands = new Map();

    commands.set("claim", claim.run);

    return commands;
}