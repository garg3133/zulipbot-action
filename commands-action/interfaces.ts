export interface CommandsActionUserConfigInterface {
  claim?:
    | {
        max_assignees?: number;
      }
    | boolean;
  labels?: {
    full_permissions?: {
      to?: string[];
    };
    restricted_permissions?: {
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
