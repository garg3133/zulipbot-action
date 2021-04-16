import updateSizeLabel from "./updateSizeLabel";

export const run = async (client, payload) => {
  const action = payload.action;

  if (client.config.size_labels && ["opened", "synchronize"].includes(action)) {
    updateSizeLabel(client, payload);
  }
};
