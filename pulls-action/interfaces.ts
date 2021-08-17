export interface PullsActionUserConfigInterface {
  size_labels?: {
    labels?: {
      [key: string]: number;
    };
    exclude?: string[];
  };
  merge_conflicts?: {
    label?: string;
    comment?: boolean;
  };
}

export interface ArtifactInterface {
  action: string;
  number: number;
  add?: string;
  remove?: string;
}
