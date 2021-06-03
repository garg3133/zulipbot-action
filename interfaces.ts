export interface CommandsActionConfigInterface {
  claim?:
    | {
        max_assignees?: number;
      }
    | boolean;
}

export interface AreasActionConfigInterface {
  area_labels?: {
    [key: string]: string;
  };
}
