import { renderHealthBreakdown } from "../components/HealthBreakdown";
import { renderActivityList } from "../components/ActivityList";
import { icon } from "../components/icons";
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

interface RepositoryDetailsProps {
  repository: Repository;
  isRefreshing: boolean;
  isConfirmingRemove: boolean;
}

function metricValue(
  repository: Repository,
  label: string,
): string | null {
  return (
    repository.healthBreakdown.find((metric) => metric.label === label)
      ?.description ?? null
  );
}

function metricRow(label: string, valueHtml: string): string {
  return `
    <div class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span class="text-sm text-slate-500">${label}</span>
      <span class="text-sm font-semibold text-slate-700">${valueHtml}</span>
    </div>
  `;
}

export function renderRepositoryDetails({
  repository,
  isRefreshing,
  isConfirmingRemove,
}: RepositoryDetailsProps): string {
  const fullName = `${repository.owner}/${repository.name}`;
  const description = repository.description || "No description provided.";
  const status = HEALTH_STATUS_STYLES[healthStatus(repository.health)];
  const activity = ACTIVITY_STATUS_STYLES[repository.activity];
  const ci = CI_STATUS_STYLES[repository.ciStatus];
  const activityDescription =
    metricValue(repository, "Activity") ?? "No commit data available";

  const actions = isConfirmingRemove
    ? `
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
        <p class="text-sm font-medium text-rose-700">
          Remove ${escapeHtml(fullName)} from monitoring?
        </p>

        <div class="flex gap-2">
          <button
            data-action="cancel-remove"
            data-repository-id="${repository.id}"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700"
          >
            Cancel
          </button>

          <button
            data-action="confirm-remove"
            data-repository-id="${repository.id}"
            class="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500"
          >
            Remove
          </button>
        </div>
      </div>
    `
    : `
      <div class="flex flex-wrap items-center gap-3">
        <button
          data-action="refresh"
          data-repository-id="${repository.id}"
          ${isRefreshing ? "disabled" : ""}
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          ${icon("refresh", `h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`)}
          ${isRefreshing ? "Refreshing..." : "Refresh"}
        </button>

        <button
          data-action="remove"
          data-repository-id="${repository.id}"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          ${icon("trash", "h-4 w-4")}
          Remove
        </button>
      </div>
    `;

  return `
    <div>
      <header class="border-b border-slate-200/70 bg-white/50 px-6 py-4 lg:px-8">
        <button
          data-action="back"
          class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ${icon("arrow-left", "h-4 w-4")}
          Back
        </button>
      </header>

      <main class="space-y-4 p-6 lg:space-y-5 lg:p-8">
        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${status.badge}">
                  <span class="h-1.5 w-1.5 rounded-full ${status.dot}"></span>
                  ${status.label} · ${repository.health}/100
                </span>

                <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${activity.text} bg-slate-50">
                  <span class="h-1.5 w-1.5 rounded-full ${activity.dot}"></span>
                  ${activity.label}
                </span>

                <span class="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  ${escapeHtml(repository.language)}
                </span>
              </div>

              <h2 class="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                ${escapeHtml(fullName)}
              </h2>

              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                ${escapeHtml(description)}
              </p>

              <p class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span class="inline-flex items-center gap-1.5">
                  ${icon("star", "h-3.5 w-3.5")}
                  ${formatNumber(repository.stars)} stars
                </span>

                <span class="inline-flex items-center gap-1.5">
                  ${icon("fork", "h-3.5 w-3.5")}
                  ${formatNumber(repository.forks)} forks
                </span>

                <span>
                  Default branch <span class="font-semibold text-slate-500">${escapeHtml(repository.defaultBranch)}</span>
                </span>

                <span>
                  Refreshed ${formatRelativeTime(repository.lastRefreshed)}
                </span>
              </p>
            </div>

            <a
              href="https://github.com/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}"
              target="_blank"
              rel="noreferrer"
              class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ${icon("external", "h-4 w-4")}
              Open on GitHub
            </a>
          </div>
        </section>

        ${actions}

        <div class="grid gap-4 lg:grid-cols-2">
          <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 class="text-sm font-bold text-slate-900">
              Health summary
            </h2>

            <p class="mt-0.5 text-xs text-slate-400">
              Based on activity, issues, pull requests, CI, releases and contributor concentration.
            </p>

            <div class="mt-4 flex items-end gap-2">
              <span class="text-4xl font-bold tracking-tight ${status.text}">
                ${repository.health}
              </span>

              <span class="mb-1 text-sm font-medium text-slate-400">
                /100 · ${status.label}
              </span>
            </div>

            <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full ${status.bar}"
                style="width: ${repository.health}%"
              ></div>
            </div>
          </section>

          <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 class="text-sm font-bold text-slate-900">
              Development activity
            </h2>

            <div class="mt-3 divide-y divide-slate-100">
              ${metricRow(
                "Activity",
                `<span class="inline-flex items-center gap-1.5 capitalize ${activity.text}">
                  <span class="h-1.5 w-1.5 rounded-full ${activity.dot}"></span>
                  ${activity.label}
                </span>`,
              )}

              ${metricRow("Last commit", escapeHtml(activityDescription))}

              ${metricRow(
                "Open issues",
                formatNumber(repository.issues),
              )}

              ${metricRow(
                "Pull requests",
                formatNumber(repository.pullRequests),
              )}

              ${metricRow(
                "CI status",
                `<span class="inline-flex items-center gap-1.5 ${ci.text}">
                  <span class="h-1.5 w-1.5 rounded-full ${ci.dot}"></span>
                  ${ci.label}
                </span>`,
              )}

              ${metricRow(
                "Latest release",
                repository.latestRelease
                  ? escapeHtml(repository.latestRelease)
                  : `<span class="text-slate-400">None</span>`,
              )}
            </div>
          </section>
        </div>

        ${renderHealthBreakdown({
          metrics: repository.healthBreakdown,
        })}

        ${renderActivityList({
          activities: repository.recentActivity,
        })}
      </main>
    </div>
  `;
}
