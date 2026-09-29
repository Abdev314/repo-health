import type { Repository } from "../types/repository";

const STORAGE_KEY = "repo-health:repositories:v1";

let repositories: Repository[] = loadRepositories();

function isRepository(value: unknown): value is Repository {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.owner === "string" &&
    typeof candidate.stars === "number" &&
    typeof candidate.forks === "number" &&
    typeof candidate.issues === "number" &&
    typeof candidate.pullRequests === "number" &&
    typeof candidate.health === "number" &&
    typeof candidate.defaultBranch === "string" &&
    Array.isArray(candidate.healthBreakdown) &&
    Array.isArray(candidate.recentActivity)
  );
}

function loadRepositories(): Repository[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isRepository);
  } catch {
    return [];
  }
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repositories));
  } catch {
    // Storage may be unavailable (private mode, quota); keep the
    // in-memory state so the app still works for this session.
  }
}

export function getRepositories(): Repository[] {
  return [...repositories];
}

export function getRepository(id: string): Repository | null {
  return repositories.find((repository) => repository.id === id) ?? null;
}

export function isMonitoring(id: string): boolean {
  return repositories.some((repository) => repository.id === id);
}

export function addRepository(repository: Repository): boolean {
  if (isMonitoring(repository.id)) {
    return false;
  }

  repositories = [
    { ...repository, lastRefreshed: new Date().toISOString() },
    ...repositories,
  ];
  persist();

  return true;
}

export function updateRepository(repository: Repository): void {
  repositories = repositories.map((current) =>
    current.id === repository.id
      ? { ...repository, lastRefreshed: new Date().toISOString() }
      : current,
  );
  persist();
}

export function removeRepository(id: string): boolean {
  const remaining = repositories.filter(
    (repository) => repository.id !== id,
  );

  if (remaining.length === repositories.length) {
    return false;
  }

  repositories = remaining;
  persist();

  return true;
}
