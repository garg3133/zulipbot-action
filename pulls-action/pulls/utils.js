/**
 * Retrieves all pages of data from a node-github method.
 * @param {String} path Path of the method in the format "api.method".
 * @param {Object} parameters Parameters to pass to the method.
 * @return {Array} Array of all data entries.
 */

export const getAllPages = async (client, path, parameters) => {
  const [api, method] = path.split(".");
  const options = client[api][method].endpoint.merge(parameters);
  const responses = await client.paginate(options);

  return responses;
};