import { getInput } from "@actions/core";
import { ActivityActionUserConfigInterface } from "../interfaces";

export default function getActionConfig(): ActivityActionUserConfigInterface {
  const config: ActivityActionUserConfigInterface = {
    skip_issue_with_label: getInput("skip_issue_with_label"),
    skip_issue_with_pull_label: getInput("skip_issue_with_pull_label"),
    days_until_warning: parseInt(getInput("days_until_warning")),
    days_until_unassign: parseInt(getInput("days_until_unassign")),
  };

  console.log("Config:", config);

  return config;
}
