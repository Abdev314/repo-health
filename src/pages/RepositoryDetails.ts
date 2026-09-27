import { renderHeader } from "../components/Header";
import { renderHealthBreakdown } from "../components/HealthBreakdown";
import { renderActivityList } from "../components/ActivityList";
import type {
  ActivityItem,
  HealthMetric,
  Repository,
} from "../types/repository";

interface RepositoryDetailsProps {
  repository: Repository;
}

const healthMetrics: HealthMetric[] = [
  {
    label: "Activity",
    score: 20,
    maxScore: 20,
    description: "Recent repository activity",
  },
  {
    label: "Issues",
    score: 20,
    maxScore: 20,
    description: "Number of open issues",
  },
  {
    label: "Pull requests",
    score: 10,
    maxScore: 20,
    description: "Open pull requests",
  },
  {
    label: "CI status",
    score: 20,
    maxScore: 20,
    description: "Latest workflow result",
  },
  {
    label: "Release",
    score: 20,
    maxScore: 20,
    description: "Latest published release",
  },
];

const activities: ActivityItem[] = [
  {
    title: "Repository updated",
    description: "New development activity was detected.",
    time: "2 hours ago",
  },
  {
    title: "CI passed",
    description: "The latest GitHub Actions workflow completed successfully.",
    time: "5 hours ago",
  },
  {
    title: "Pull request opened",
    description: "A new pull request is currently open.",
    time: "1 day ago",
  },
];

export function renderRepositoryDetails({
  repository,
}: RepositoryDetailsProps): string {
  return `
    <div class="min-h-screen bg-[#f8f8f6]">
      ${renderHeader({
        title: "Repository details",
        subtitle: `${repository.owner} / ${repository.name}`,
      })}

      <main class="space-y-6 p-6 lg:p-8">
        <button
          id="back-to-dashboard"
          class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <span>←</span>
          Back to dashboard
        </button>

        <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>

                <span class="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  ${repository.activity}
                </span>
              </div>

              <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                ${repository.owner} / ${repository.name}
              </h2>

              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                ${repository.description}
              </p>
            </div>

            <a
              href="https://github.com/${repository.owner}/${repository.name}"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open on GitHub
            </a>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
            <div>
              <p class="text-xs text-slate-400">Language</p>
              <p class="mt-1 text-sm font-semibold text-slate-700">
                ${repository.language}
              </p>
            </div>

            <div>
              <p class="text-xs text-slate-400">Stars</p>
              <p class="mt-1 text-sm font-semibold text-slate-700">
                ${repository.stars}
              </p>
            </div>

            <div>
              <p class="text-xs text-slate-400">Forks</p>
              <p class="mt-1 text-sm font-semibold text-slate-700">
                ${repository.forks}
              </p>
            </div>

            <div>
              <p class="text-xs text-slate-400">Default branch</p>
              <p class="mt-1 text-sm font-semibold text-slate-700">
                ${repository.defaultBranch}
              </p>
            </div>
          </div>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
          <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:col-span-2">
            <p class="text-sm font-medium text-slate-500">
              Overall health
            </p>

            <div class="mt-3 flex items-end gap-2">
              <span class="text-4xl font-bold tracking-tight text-slate-900">
                ${repository.health}
              </span>

              <span class="mb-1 text-sm font-medium text-slate-400">
                /100
              </span>
            </div>

            <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-slate-800"
                style="width: ${repository.health}%"
              ></div>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">
              CI status
            </p>

            <div class="mt-4 flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>

              <span class="text-lg font-bold capitalize text-slate-900">
                ${repository.ciStatus}
              </span>
            </div>

            <p class="mt-2 text-xs leading-5 text-slate-400">
              Latest workflow result
            </p>
          </div>
        </section>

        ${renderHealthBreakdown({
          metrics: healthMetrics,
        })}

        <section class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 class="text-base font-bold text-slate-900">
              Repository metrics
            </h2>

            <div class="mt-5 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-500">Open issues</span>
                <span class="text-sm font-semibold text-slate-700">
                  ${repository.issues}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-500">Pull requests</span>
                <span class="text-sm font-semibold text-slate-700">
                  ${repository.pullRequests}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-500">Latest release</span>
                <span class="text-sm font-semibold text-slate-700">
                  ${repository.latestRelease ?? "None"}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-500">Default branch</span>
                <span class="text-sm font-semibold text-slate-700">
                  ${repository.defaultBranch}
                </span>
              </div>
            </div>
          </div>

          ${renderActivityList({
            activities,
          })}
        </section>
      </main>
    </div>
  `;
}