import { Client } from "./types";

/**
 * Sorts and removes duplicate elements from a given array.
 *
 * @param {Array} array Array to remove duplicates from.
 * @return {Array} Sorted array containing only unique entries.
 */

export const deduplicate = (array: string[]): string[] => {
  return Array.from(new Set(array)).sort();
};

/**
 * Retrieves all pages of data from a node-github method.
 * @param {String} api Rest API endpoint to use, ex. 'issues'.
 * @param {String} method API endpoint method to use, ex. 'listComments'.
 * @param {Object} parameters Parameters to pass to the method.
 * @return {Array} Array of all data entries.
 */

export const getAllPages = async <P, R>(
  client: Client,
  api: string,
  method: string,
  parameters: P
): Promise<R[]> => {
  const options = client[api][method].endpoint.merge(parameters);
  const responses: R[] = await client.paginate(options);

  return responses;
};