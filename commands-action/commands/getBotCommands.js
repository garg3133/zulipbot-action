import * as claim from "./claim/claim";
import * as abandon from "./abandon/abandon";

export default function getBotCommands() {
    const commands = new Map();

    commands.set("claim", claim.run);
    commands.set("abandon", abandon.run);

    return commands;
}