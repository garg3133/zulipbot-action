export interface CommandsActionUserConfigInterface {
  assign?:
    | {
        max_assignees?: number;
        add_as_collaborator?: boolean;
        new_contributors?: {
          max_issue_claims?: number;
          assign_only_if?: {
            all_labels_absent?: string[];
            any_label_present?: string[];
          };
        };
      }
    | boolean;
  label?: {
    full_permission?: {
      to?: string[];
    };
    restricted_permission?: {
      to?: string[];
      allowed_labels?: string[];
      restricted_labels?: string[];
    };
  };
}

export interface CommandsActionDefaultConfigInterface {
  assign: {
    max_assignees: number;
  };
}
