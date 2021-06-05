export interface CommandsActionUserConfigInterface {
  claim?:
    | {
        max_assignees?: number;
      }
    | boolean;
}
