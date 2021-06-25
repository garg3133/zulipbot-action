import { getOctokit } from "@actions/github";
import { getOctokitLogin } from "../client/octokit";

// Mock @action/github for this test run
// Importing this module or anything from this module
// is not required unless necessary.
jest.mock("@actions/github");

const octokit = getOctokit("");
const getAuthenticatedMock = jest.spyOn(octokit.users, "getAuthenticated");

afterAll(() => jest.restoreAllMocks());

describe("get octokit login", () => {
  it("returns username if api call is resolved", async () => {
    getAuthenticatedMock.mockResolvedValue(<any>{
      data: {
        login: "octo-cat",
      },
    });

    const username = await getOctokitLogin(octokit);

    expect(getAuthenticatedMock).toHaveBeenCalledTimes(1);
    expect(username).toEqual("octo-cat");
  });

  it("throws error if api call is rejected", async () => {
    getAuthenticatedMock.mockRejectedValue({
      status: 404,
      message: "Not Found",
    });

    expect.assertions(1);
    await expect(getOctokitLogin(octokit)).rejects.toThrowError(
      "Received unexpected API status code 404 while requesting for bot's username."
    );
  });
});
