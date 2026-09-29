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
  busFactor?: number | null;
  topContributorShare?: number | null;
  triage?: TriageSignals;
}

export interface TriageSignals {
  openItemCount: number;
  medianAgeDays: number;
  stale30Percent: number;
  stale90Percent: number;
  oldestAgeDays: number;
  oldestItemType: "issue" | "pull_request" | null;
  oldestItemTitle: string | null;
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
