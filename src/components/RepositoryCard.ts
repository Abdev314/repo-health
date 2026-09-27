import type { Repository } from "../types/repository";

interface RepositoryCardProps {
  repository: Repository;
}

export function renderRepositoryCard({
  repository,
}: RepositoryCardProps): string {
  return `
    <article
      data-repository-card
      class="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>

            <span class="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              ${repository.activity}
            </span>
          </div>

          <h3 class="mt-2 truncate text-base font-bold text-slate-900">
            ${repository.owner} / ${repository.name}
          </h3>

          <p class="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            ${repository.description}
          </p>
        </div>

        <div class="shrink-0 text-left sm:text-right">
          <p class="text-xs font-medium text-slate-400">Health</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">
            ${repository.health}
            <span class="text-sm font-medium text-slate-400">/100</span>
          </p>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <div>
          <p class="text-xs text-slate-400">Issues</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">
            ${repository.issues}
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-400">Pull requests</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">
            ${repository.pullRequests}
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-400">CI</p>
          <p class="mt-1 text-sm font-semibold text-emerald-600">
            ${repository.ciStatus}
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-400">Language</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">
            ${repository.language}
          </p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span>★ ${repository.stars} stars</span>
        <span>⑂ ${repository.forks} forks</span>
        <span>main: ${repository.defaultBranch}</span>
      </div>
    </article>
  `;
}