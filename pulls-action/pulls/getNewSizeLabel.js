import { getAllPages } from "../../utils";

export default async function getNewSizeLabel(client, number, owner, repo) {
  const configSizeLabels = client.config.size_labels.labels;
  const excludedFiles = client.config.size_labels.exclude || [];

  const files = await getAllPages(client, "pulls.listFiles", {
    owner,
    repo,
    pull_number: number,
  });

  const changes = files
    .filter((file) => {
      const filenameMatch = excludedFiles.filter((excludedName) => {
        return file.filename.includes(excludedName);
      });
      return filenameMatch.length == 0;
    })
    .reduce((sum, file) => sum + file.changes, 0);

  let maxSize = -1;
  let newSizeLabel;

  for (const [name, size] of Object.entries(configSizeLabels)) {
    if (size > maxSize && changes >= size) {
      maxSize = size;
      newSizeLabel = name;
    }
  }

  return newSizeLabel;
}
