export interface CommandsActionUserConfigInterface {
  claim?:
    | {
        max_assignees?: number;
      }
    | boolean;
}

export interface CommandsActionDefaultConfigInterface {
  claim: {
    max_assignees: number;
  };
}
