import * as claim from "./claim/claim";
import * as abandon from "./abandon/abandon";

import { CommandRunFunction } from "../types";

export default function getBotCommands(): Map<string, CommandRunFunction> {
  const commands: Map<string, CommandRunFunction> = new Map();

  commands.set("claim", claim.run);
  commands.set("abandon", abandon.run);

  return commands;
}
