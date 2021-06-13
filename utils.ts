import { OctokitClient } from "./client/octokit";

/**
 * Sorts and removes duplicate elements from a given array.
 *
 * @param {Array} array Array to remove duplicates from.
 * @return {Array} Sorted array containing only unique entries.
 */

export const deduplicate = <T>(array: T[]): T[] => {
  return Array.from(new Set(array)).sort();
};

/**
 * Retrieves all pages of data from a node-github method.
 * @param {Octokit} octokit Instance of Octokit client.
 * @param {String} api Rest API endpoint to use, ex. 'issues'.
 * @param {String} method API endpoint method to use, ex. 'listComments'.
 * @param {Object} parameters Parameters to pass to the method.
 * @return {Array} Array of all data entries.
 */

export const getAllPages = async <P, R>(
  octokit: OctokitClient,
  api: string,
  method: string,
  parameters: P
): Promise<R[]> => {
  const options = octokit[api][method].endpoint.merge(parameters);
  const responses: R[] = await octokit.paginate(options);

  return responses;
};
