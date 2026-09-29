import { icon } from "./icons";
import {
  ACTIVITY_STATUS_STYLES,
  CI_STATUS_STYLES,
  HEALTH_STATUS_STYLES,
  escapeHtml,
  formatNumber,
  formatRelativeTime,
  healthStatus,
} from "../utils/format";
import type { Repository } from "../types/repository";

interface RepositoryCardProps {
  repository: Repository;
}

export function busFactorRisk(repository: Repository): {
  label: string;
  badge: string;
} | null {
  const busFactor = repository.busFactor ?? null;

  if (busFactor === null || busFactor >= 3) {
    return null;
  }

  if (busFactor <= 1) {
    return {
      label: `Bus factor ${busFactor}`,
      badge: "bg-rose-50 text-rose-700",
    };
  }

  return {
    label: `Bus factor ${busFactor}`,
    badge: "bg-amber-50 text-amber-700",
  };
}

export function triageRisk(repository: Repository): {
  label: string;
  badge: string;
} | null {
  const triage = repository.triage ?? null;

  if (!triage || triage.openItemCount === 0) {
    return null;
  }

  if (triage.medianAgeDays > 90) {
    return {
      label: "High triage risk",
      badge: "bg-rose-50 text-rose-700",
    };
  }

  if (triage.medianAgeDays > 30) {
    return {
      label: "Stale triage",
      badge: "bg-amber-50 text-amber-700",
    };
  }

  return null;
}

export function renderRepositoryCard({
  repository,
}: RepositoryCardProps): string {
  const status = HEALTH_STATUS_STYLES[healthStatus(repository.health)];
  const activity = ACTIVITY_STATUS_STYLES[repository.activity];
  const ci = CI_STATUS_STYLES[repository.ciStatus];
  const busRisk = busFactorRisk(repository);
  const backlogRisk = triageRisk(repository);
  const fullName = `${repository.owner}/${repository.name}`;
  const description = repository.description || "No description provided.";

  return `
    <article
      data-action="view"
      data-repository-id="${repository.id}"
      title="View ${escapeHtml(fullName)}"
      class="group flex cursor-pointer flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="h-2 w-2 rounded-full ${activity.dot}"></span>

            <span class="text-xs font-semibold uppercase tracking-wide ${activity.text}">
              ${activity.label}
            </span>

            ${
              busRisk
                ? `<span class="rounded-full px-2 py-0.5 text-[11px] font-semibold ${busRisk.badge}">${busRisk.label}</span>`
                : ""
            }

            ${
              backlogRisk
                ? `<span class="rounded-full px-2 py-0.5 text-[11px] font-semibold ${backlogRisk.badge}">${backlogRisk.label}</span>`
                : ""
            }
          </div>

          <h3 class="mt-2 truncate text-base font-bold text-slate-900">
            ${escapeHtml(fullName)}
          </h3>

          <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
            ${escapeHtml(description)}
          </p>
        </div>

        <div class="shrink-0 text-right">
          <p class="text-xs font-medium text-slate-400">Health</p>
          <p class="mt-1 text-2xl font-bold ${status.text}">
            ${repository.health}
            <span class="text-sm font-medium text-slate-400">/100</span>
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <div>
          <p class="text-xs text-slate-400">Issues</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">
            ${formatNumber(repository.issues)}
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-400">Pull requests</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">
            ${formatNumber(repository.pullRequests)}
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-400">CI</p>
          <p class="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold ${ci.text}">
            <span class="h-1.5 w-1.5 rounded-full ${ci.dot}"></span>
            ${ci.label}
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-400">Language</p>
          <p class="mt-1 truncate text-sm font-semibold text-slate-700">
            ${escapeHtml(repository.language)}
          </p>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
        <span class="inline-flex items-center gap-1">
          ${icon("star", "h-3.5 w-3.5")}
          ${formatNumber(repository.stars)}
        </span>

        <span class="inline-flex items-center gap-1">
          ${icon("fork", "h-3.5 w-3.5")}
          ${formatNumber(repository.forks)}
        </span>

        <span class="hidden truncate sm:inline">
          ${escapeHtml(repository.defaultBranch)}
        </span>

        <span class="ml-auto inline-flex items-center gap-1">
          ${icon("clock", "h-3.5 w-3.5")}
          ${formatRelativeTime(repository.lastRefreshed)}
        </span>

        <span class="inline-flex items-center gap-1 font-semibold text-indigo-600">
          View details
          ${icon("arrow-right", "h-3.5 w-3.5")}
        </span>
      </div>
    </article>
  `;
}
