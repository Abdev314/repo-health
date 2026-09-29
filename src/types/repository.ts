export type View = "dashboard" | "repositories" | "repository";

export type ActivityType = "commit" | "release" | "ci";

export type ActivityStatus = "active" | "inactive";

export type CiStatus = "passing" | "failing" | "unknown";

export interface Repository {
  id: string;
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  issues: number;
  pullRequests: number;
  health: number;
  healthBreakdown: HealthMetric[];
  activity: ActivityStatus;
  ciStatus: CiStatus;
  latestRelease: string | null;
  defaultBranch: string;
  recentActivity: ActivityItem[];
  lastRefreshed: string;
}

export interface HealthMetric {
  label: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface ActivityItem {
  type: ActivityType;
  title: string;
  description: string;
  time: string;
}
