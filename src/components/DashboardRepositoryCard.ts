import { icon } from "./icons";
import { busFactorRisk, triageRisk } from "./RepositoryCard";
import {
  ACTIVITY_STATUS_STYLES,
  HEALTH_STATUS_STYLES,
  escapeHtml,
  formatNumber,
  healthStatus,
} from "../utils/format";
import type { Repository } from "../types/repository";

interface DashboardRepositoryCardProps {
  repository: Repository;
}

export function renderDashboardRepositoryCard({
  repository,
}: DashboardRepositoryCardProps): string {
  const status = HEALTH_STATUS_STYLES[healthStatus(repository.health)];
  const activity = ACTIVITY_STATUS_STYLES[repository.activity];
  const busRisk = busFactorRisk(repository);
  const backlogRisk = triageRisk(repository);
  const fullName = `${repository.owner}/${repository.name}`;

  const chips: string[] = [];

  if (busRisk) {
    chips.push(
      `<span class="rounded-full px-2 py-0.5 text-[11px] font-semibold ${busRisk.badge}">${busRisk.label}</span>`,
    );
  }

  if (backlogRisk) {
    chips.push(
      `<span class="rounded-full px-2 py-0.5 text-[11px] font-semibold ${backlogRisk.badge}">${backlogRisk.label}</span>`,
    );
  }

  if (repository.issues > 0) {
    chips.push(
      `<span class="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">${formatNumber(repository.issues)} open issues</span>`,
    );
  }

  return `
    <article
      data-action="view"
      data-repository-id="${repository.id}"
      title="View ${escapeHtml(fullName)}"
      class="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow"
    >
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 shrink-0 rounded-full ${activity.dot}"></span>

          <h3 class="truncate text-sm font-bold text-slate-900">
            ${escapeHtml(fullName)}
          </h3>
        </div>

        ${
          chips.length
            ? `<div class="mt-1.5 flex flex-wrap items-center gap-1.5">${chips.join("")}</div>`
            : ""
        }
      </div>

      <div class="shrink-0 text-right">
        <p class="text-lg font-bold leading-6 ${status.text}">
          ${repository.health}
          <span class="text-xs font-medium text-slate-400">/100</span>
        </p>
      </div>

      <span class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600">
        <span class="hidden sm:inline">View details</span>
        ${icon("chevron-right", "h-4 w-4")}
      </span>
    </article>
  `;
}
