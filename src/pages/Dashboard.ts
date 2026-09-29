import { renderHeader } from "../components/Header";
import { renderStatCard } from "../components/StatCard";
import { renderSectionCard } from "../components/SectionCard";
import { renderRepositoryCard } from "../components/RepositoryCard";
import { renderEmptyState } from "../components/EmptyState";
import { icon } from "../components/icons";
import type { IconName } from "../components/icons";
import {
  HEALTH_STATUS_STYLES,
  escapeHtml,
  formatNumber,
  formatRelativeTime,
  healthStatus,
} from "../utils/format";
import type { HealthStatus } from "../utils/format";
import type { Repository } from "../types/repository";

interface DashboardProps {
  repositories: Repository[];
}

interface AttentionItem {
  iconName: IconName;
  tone: "rose" | "amber" | "slate";
  message: string;
  repositoryId: string;
}

const TONE_STYLES: Record<AttentionItem["tone"], string> = {
  rose: "bg-rose-50 text-rose-500",
  amber: "bg-amber-50 text-amber-500",
  slate: "bg-slate-100 text-slate-400",
};

const STATUS_ORDER: HealthStatus[] = ["healthy", "warning", "at-risk"];

function fullName(repository: Repository): string {
  return `${repository.owner}/${repository.name}`;
}

function metricDescription(
  repository: Repository,
  label: string,
): string | null {
  return (
    repository.healthBreakdown.find((metric) => metric.label === label)
      ?.description ?? null
  );
}

function latestActivityTime(repository: Repository): string | null {
  if (!repository.recentActivity.length) {
    return null;
  }

  return repository.recentActivity.reduce(
    (latest, item) => (item.time > latest ? item.time : latest),
    repository.recentActivity[0].time,
  );
}

function buildAttentionItems(repositories: Repository[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const repository of repositories) {
    if (repository.ciStatus === "failing") {
      items.push({
        iconName: "x-circle",
        tone: "rose",
        message: "CI is failing on the latest workflow run",
        repositoryId: repository.id,
      });
    }
  }

  for (const repository of repositories) {
    if (repository.activity === "inactive") {
      items.push({
        iconName: "clock",
        tone: "amber",
        message:
          metricDescription(repository, "Activity") ??
          "No commits in the last 90 days",
        repositoryId: repository.id,
      });
    }
  }

  const issueHeavy = [...repositories]
    .filter((repository) => repository.issues > 5)
    .sort((a, b) => b.issues - a.issues)
    .slice(0, 3);

  for (const repository of issueHeavy) {
    items.push({
      iconName: "alert",
      tone: "amber",
      message: `${formatNumber(repository.issues)} open issues`,
      repositoryId: repository.id,
    });
  }

  for (const repository of repositories) {
    if (repository.ciStatus === "unknown") {
      items.push({
        iconName: "alert",
        tone: "slate",
        message: "CI status unknown — no recent workflow runs",
        repositoryId: repository.id,
      });
    }
  }

  return items;
}

function renderAttentionList(items: AttentionItem[], repositories: Repository[]): string {
  if (!items.length) {
    return `
      <div class="py-8 text-center">
        <p class="text-sm font-medium text-slate-500">Nothing needs attention</p>
        <p class="mt-1 text-xs text-slate-400">All monitored repositories look healthy.</p>
      </div>
    `;
  }

  const names = new Map(
    repositories.map((repository) => [repository.id, fullName(repository)]),
  );

  return `
    <div class="space-y-1">
      ${items
        .map(
          (item) => `
            <button
              data-action="view"
              data-repository-id="${item.repositoryId}"
              class="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
            >
              <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${TONE_STYLES[item.tone]}">
                ${icon(item.iconName, "h-3.5 w-3.5")}
              </span>

              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold text-slate-800">
                  ${escapeHtml(names.get(item.repositoryId) ?? "Repository")}
                </span>

                <span class="mt-0.5 block text-xs leading-5 text-slate-400">
                  ${escapeHtml(item.message)}
                </span>
              </span>

              <span class="ml-auto mt-1 shrink-0 text-slate-300">
                ${icon("chevron-right", "h-4 w-4")}
              </span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderRecentActivity(repositories: Repository[]): string {
  const recent = repositories
    .map((repository) => ({
      repository,
      time: latestActivityTime(repository),
    }))
    .filter((entry): entry is { repository: Repository; time: string } =>
      Boolean(entry.time),
    )
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, 5);

  if (!recent.length) {
    return `
      <div class="py-8 text-center">
        <p class="text-sm font-medium text-slate-500">No recent activity</p>
        <p class="mt-1 text-xs text-slate-400">GitHub has not reported any recent events yet.</p>
      </div>
    `;
  }

  return `
    <div class="space-y-1">
      ${recent
        .map(({ repository, time }) => {
          const latest = repository.recentActivity.find(
            (item) => item.time === time,
          );

          return `
            <button
              data-action="view"
              data-repository-id="${repository.id}"
              class="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
            >
              <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                ${icon("activity", "h-3.5 w-3.5")}
              </span>

              <span class="min-w-0 flex-1">
                <span class="flex items-baseline justify-between gap-3">
                  <span class="truncate text-sm font-semibold text-slate-800">
                    ${escapeHtml(fullName(repository))}
                  </span>

                  <span class="shrink-0 text-xs text-slate-400">
                    ${formatRelativeTime(time)}
                  </span>
                </span>

                <span class="mt-0.5 block truncate text-xs leading-5 text-slate-400">
                  ${escapeHtml(latest?.title ?? "Activity reported")}
                </span>
              </span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderHealthOverview(repositories: Repository[]): string {
  const groups = STATUS_ORDER.map((status) => ({
    status,
    style: HEALTH_STATUS_STYLES[status],
    repositories: repositories.filter(
      (repository) => healthStatus(repository.health) === status,
    ),
  }));

  return `
    <div class="space-y-4">
      ${groups
        .map(
          ({ status, style, repositories: group }) => `
            <div class="flex items-start gap-3">
              <span class="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}"></span>

              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-3">
                  <p class="text-sm font-semibold text-slate-700">
                    ${style.label}
                  </p>

                  <p class="text-sm font-bold ${style.text}">
                    ${group.length}
                  </p>
                </div>

                <div class="mt-1.5 flex flex-wrap gap-1.5">
                  ${
                    group.length
                      ? group
                          .slice(0, 4)
                          .map(
                            (repository) => `
                              <button
                                data-action="view"
                                data-repository-id="${repository.id}"
                                title="${escapeHtml(fullName(repository))}"
                                class="max-w-44 truncate rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                              >
                                ${escapeHtml(fullName(repository))}
                              </button>
                            `,
                          )
                          .join("") +
                        (group.length > 4
                          ? `<span class="px-1 text-xs text-slate-300">+${group.length - 4} more</span>`
                          : "")
                      : `<span class="text-xs text-slate-300">None</span>`
                  }
                </div>
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

export function renderDashboard({
  repositories,
}: DashboardProps): string {
  if (!repositories.length) {
    return `
      <div>
        ${renderHeader({
          title: "Dashboard",
          subtitle: "An overview of your monitored repositories.",
          showAddButton: true,
        })}

        <main class="p-6 lg:p-8">
          ${renderEmptyState({
            title: "No repositories monitored yet.",
            description:
              "Add your first GitHub repository to start tracking its health.",
            showAddButton: true,
          })}
        </main>
      </div>
    `;
  }

  const total = repositories.length;
  const active = repositories.filter(
    (repository) => repository.activity === "active",
  ).length;
  const averageHealth = Math.round(
    repositories.reduce((sum, repository) => sum + repository.health, 0) /
      total,
  );
  const openIssues = repositories.reduce(
    (sum, repository) => sum + repository.issues,
    0,
  );
  const failingCi = repositories.filter(
    (repository) => repository.ciStatus === "failing",
  ).length;
  const averageStatus = HEALTH_STATUS_STYLES[healthStatus(averageHealth)];
  const attentionItems = buildAttentionItems(repositories).slice(0, 6);
  const preview = repositories.slice(0, 3);

  return `
    <div>
      ${renderHeader({
        title: "Dashboard",
        subtitle: "An overview of your monitored repositories.",
        showAddButton: true,
      })}

      <main class="space-y-4 p-6 lg:space-y-5 lg:p-8">
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          ${renderStatCard({
            label: "Repositories",
            value: formatNumber(total),
            description: "Currently monitored",
            iconName: "folder",
          })}

          ${renderStatCard({
            label: "Active",
            value: formatNumber(active),
            description: "Committed in the last 90 days",
            iconName: "activity",
          })}

          ${renderStatCard({
            label: "Average health",
            value: averageHealth,
            description: averageStatus.label,
            iconName: "heart",
            valueClass: averageStatus.text,
          })}

          ${renderStatCard({
            label: "Open issues",
            value: formatNumber(openIssues),
            description: "Across monitored repositories",
            iconName: "alert",
          })}

          ${renderStatCard({
            label: "Failing CI",
            value: formatNumber(failingCi),
            description: "Latest workflow run failed",
            iconName: "x-circle",
            valueClass: failingCi > 0 ? "text-rose-600" : undefined,
          })}
        </section>

        <div class="grid gap-4 lg:grid-cols-3">
          ${renderSectionCard({
            title: "Health overview",
            subtitle: "Distribution of repository health",
            bodyHtml: renderHealthOverview(repositories),
          })}

          ${renderSectionCard({
            title: "Needs attention",
            subtitle: "Repositories to look at first",
            bodyHtml: renderAttentionList(attentionItems, repositories),
          })}

          ${renderSectionCard({
            title: "Recently active",
            subtitle: "Latest events across repositories",
            bodyHtml: renderRecentActivity(repositories),
          })}
        </div>

        <section>
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">
                Repositories
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                ${
                  total > 3
                    ? `Showing ${preview.length} of ${formatNumber(total)} monitored repositories.`
                    : "Your monitored GitHub repositories."
                }
              </p>
            </div>

            <button
              data-nav="repositories"
              class="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              View all
              ${icon("arrow-right", "h-4 w-4")}
            </button>
          </div>

          <div class="grid gap-4 xl:grid-cols-3">
            ${preview
              .map((repository) => renderRepositoryCard({ repository }))
              .join("")}
          </div>
        </section>
      </main>
    </div>
  `;
}
