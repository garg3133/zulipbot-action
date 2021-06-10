export interface PullsActionUserConfigInterface {
  size_labels?: {
    labels?: {
      [key: string]: number;
    };
    exclude?: string[];
  };
}

export interface ArtifactInterface {
  action: string;
  number: number;
  add?: string;
  remove?: string;
}
