jest.mock("@actions/github");

import { getOctokit } from "@actions/github";
import { getOctokitLogin } from "../client/octokit";

const octokit = getOctokit("");
const getAuthenticatedMock = octokit.users.getAuthenticated;

describe("get octokit login", () => {
  test("getAuthenticatedMock is mock function", () => {
    expect(jest.isMockFunction(getAuthenticatedMock)).toBeTruthy();
    // console.log(getAuthenticatedMock);
  });
  it("returns username if api call is resolved", async () => {
    (
      getAuthenticatedMock as jest.MockedFunction<typeof getAuthenticatedMock>
    ).mockResolvedValue(<any>{
      data: {
        login: "octo-cat",
      },
    });

    const username = await getOctokitLogin(octokit);

    expect(getAuthenticatedMock).toHaveBeenCalledTimes(1);
    expect(username).toEqual("octo-cat");
  });

  it("throws error if api call is rejected", async () => {
    (
      getAuthenticatedMock as jest.MockedFunction<typeof getAuthenticatedMock>
    ).mockRejectedValue({
      status: 404,
      message: "Not Found",
    });

    expect.assertions(1);
    await expect(getOctokitLogin(octokit)).rejects.toThrowError(
      "Received unexpected API status code 404 while requesting for bot's username."
    );
  });
});
