import { getInput } from "@actions/core";
import { ActivityActionUserConfigInterface } from "../interfaces";

export default function getActionConfig(): ActivityActionUserConfigInterface {
  const config: ActivityActionUserConfigInterface = {
    issue_assigned_label: getInput("issue_assigned_label"),
    skip_issue_with_label: getInput("skip_issue_with_label"),
    skip_issue_with_pull_label: getInput("skip_issue_with_pull_label"),
    clear_closed_issue: getInput("clear_closed_issue") === "true",
    days_until_warning: parseInt(getInput("days_until_warning")),
    days_until_unassign: parseInt(getInput("days_until_unassign")),
    assign_pull_to_reviewer: getInput("assign_pull_to_reviewer") === "true",
  };

  console.log("Config:", config);

  return config;
}
