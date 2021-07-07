export interface CommandsActionUserConfigInterface {
  claim?:
    | {
        max_assignees?: number;
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
  claim: {
    max_assignees: number;
  };
}
