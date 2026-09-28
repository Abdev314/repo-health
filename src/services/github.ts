import type { Repository } from "../types/repository";

const API_URL = "http://127.0.0.1:5000";

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.error ?? `API request failed: ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchRepository(
  owner: string,
  repository: string,
): Promise<Repository> {
  return apiRequest<Repository>(
    `/api/repositories/${owner}/${repository}`,
  );
}