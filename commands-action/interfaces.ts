export interface CommandsActionUserConfigInterface {
  assign?:
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
  assign: {
    max_assignees: number;
  };
}
