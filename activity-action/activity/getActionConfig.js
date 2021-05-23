import { getInput } from "@actions/core";

export default function getActionConfig() {
  const config = new Object();

  config.issue_assigned_label = getInput("issue_assigned_label");
  config.skip_issue_with_label = getInput("skip_issue_with_label");
  config.skip_issue_with_pull_label = getInput("skip_issue_with_pull_label");
  config.clear_closed_issue = getInput("clear_closed_issue") === "true";
  config.days_until_warning = parseInt(
    getInput("days_until_warning", { required: true })
  );
  config.days_until_unassign = parseInt(
    getInput("days_until_unassign", { required: true })
  );
  config.assign_pull_to_reviewer =
    getInput("assign_pull_to_reviewer") === "true";

  console.log(config);

  return config;
}
