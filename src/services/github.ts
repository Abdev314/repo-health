import type { Repository } from "../types/repository";

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://127.0.0.1:5000";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`);
  } catch {
    throw new ApiError(
      "Could not reach the Repo Health server. Is the Flask backend running?",
      0,
    );
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new ApiError(
      error?.error ?? "The server returned an unexpected error.",
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchRepository(
  owner: string,
  repository: string,
): Promise<Repository> {
  return apiRequest<Repository>(
    `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`,
  );
}
