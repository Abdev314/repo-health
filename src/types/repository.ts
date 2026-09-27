export type View = "dashboard" | "repository";

export interface Repository {
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  issues: number;
  pullRequests: number;
  health: number;
  activity: "active" | "inactive";
  ciStatus: "passing" | "failing" | "unknown";
  latestRelease: string | null;
  defaultBranch: string;
}

export interface HealthMetric {
  label: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface ActivityItem {
  title: string;
  description: string;
  time: string;
}