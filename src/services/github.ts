const GITHUB_API_URL = "https://api.github.com";

export async function fetchRepository(
  owner: string,
  repository: string,
): Promise<unknown> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repository}`,
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed: ${response.status}`,
    );
  }

  return response.json();
}