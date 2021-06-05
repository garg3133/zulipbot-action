import * as fs from "fs";
import { load as yaml_load } from "js-yaml";
import { CommandsActionDefaultConfigInterface } from "../interfaces";

export function getDefaultConfig(): CommandsActionDefaultConfigInterface {
  const content: string = fs.readFileSync(
    `${__dirname}/../config/default-config.yml`,
    "utf-8"
  );
  const defaultConfig = yaml_load(content);

  return defaultConfig as CommandsActionDefaultConfigInterface;
}
