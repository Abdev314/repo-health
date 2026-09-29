import type { ActivityStatus, CiStatus } from "../types/repository";

export function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatRelativeTime(isoDate: string): string {
  const timestamp = new Date(isoDate).getTime();

  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year${years === 1 ? "" : "s"} ago`;
}

// --- shared status styles -------------------------------------------

export type HealthStatus = "healthy" | "warning" | "at-risk";

export interface StatusStyle {
  label: string;
  dot: string;
  text: string;
  badge: string;
  bar: string;
}

export function healthStatus(health: number): HealthStatus {
  if (health >= 75) {
    return "healthy";
  }

  if (health >= 50) {
    return "warning";
  }

  return "at-risk";
}

export const HEALTH_STATUS_STYLES: Record<HealthStatus, StatusStyle> = {
  healthy: {
    label: "Healthy",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
  },
  warning: {
    label: "Needs attention",
    dot: "bg-amber-500",
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
  },
  "at-risk": {
    label: "At risk",
    dot: "bg-rose-500",
    text: "text-rose-600",
    badge: "bg-rose-50 text-rose-700",
    bar: "bg-rose-500",
  },
};

export const ACTIVITY_STATUS_STYLES: Record<
  ActivityStatus,
  Pick<StatusStyle, "label" | "dot" | "text">
> = {
  active: { label: "Active", dot: "bg-emerald-500", text: "text-emerald-600" },
  inactive: { label: "Inactive", dot: "bg-slate-300", text: "text-slate-400" },
};

export const CI_STATUS_STYLES: Record<
  CiStatus,
  Pick<StatusStyle, "label" | "dot" | "text">
> = {
  passing: { label: "Passing", dot: "bg-emerald-500", text: "text-emerald-600" },
  failing: { label: "Failing", dot: "bg-rose-500", text: "text-rose-600" },
  unknown: { label: "Unknown", dot: "bg-slate-300", text: "text-slate-400" },
};
