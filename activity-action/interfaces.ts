export interface ActivityActionUserConfigInterface {
  issue_assigned_label: string;
  skip_issue_with_label: string;
  skip_issue_with_pull_label: string;
  clear_closed_issue: boolean;
  days_until_warning: number;
  days_until_unassign: number;
  assign_pull_to_reviewer: boolean;
}
