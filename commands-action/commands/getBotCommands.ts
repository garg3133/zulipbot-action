import * as claim from "./assign/claim";
import * as abandon from "./assign/abandon";
import * as add from "./label/add";
import * as remove from "./label/remove";

import { CommandRunFunction } from "../types";

export default function getBotCommands(): Map<string, CommandRunFunction> {
  const commands: Map<string, CommandRunFunction> = new Map();

  // Put all the aliases here (map them to the same function)
  commands.set("claim", claim.run);
  commands.set("abandon", abandon.run);
  commands.set("add", add.run);
  commands.set("remove", remove.run);

  return commands;
}
