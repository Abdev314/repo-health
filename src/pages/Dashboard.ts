import { renderHeader } from "../components/Header";
import { renderStatCard } from "../components/StatCard";
import { renderRepositoryCard } from "../components/RepositoryCard";
import { renderAddRepositoryModal } from "../components/AddRepositoryModal";
import type { Repository } from "../types/repository";

interface DashboardProps {
  repository: Repository | null;
}

export function renderDashboard({
  repository,
}: DashboardProps): string {
  const repositories = repository ? 1 : 0;
  const activeRepositories =
    repository?.activity === "active" ? 1 : 0;
  const averageHealth = repository?.health ?? 0;
  const openIssues = repository?.issues ?? 0;

  return `
    <div class="min-h-screen bg-[#f8f8f6]">
      ${renderHeader({
        title: "Dashboard",
        subtitle: "Monitor the health of your repositories.",
        showAddButton: true,
      })}

      <main class="space-y-6 p-6 lg:p-8">
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          ${renderStatCard({
            label: "Repositories",
            value: repositories,
            description: "Currently monitored",
          })}

          ${renderStatCard({
            label: "Active",
            value: activeRepositories,
            description: "Active in the last 90 days",
          })}

          ${renderStatCard({
            label: "Average health",
            value: averageHealth,
            description: "Across all repositories",
          })}

          ${renderStatCard({
            label: "Open issues",
            value: openIssues,
            description: "Across monitored repositories",
          })}
        </section>

        <section>
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-base font-bold text-slate-900">
                Repositories
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                Your monitored GitHub repositories.
              </p>
            </div>
          </div>

          ${
            repository
              ? renderRepositoryCard({ repository })
              : `
                <div class="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                  <h3 class="text-sm font-semibold text-slate-700">
                    No repositories yet
                  </h3>

                  <p class="mt-1 text-sm text-slate-400">
                    Add a GitHub repository to start monitoring it.
                  </p>
                </div>
              `
          }
        </section>
      </main>

      ${renderAddRepositoryModal()}
    </div>
  `;
}