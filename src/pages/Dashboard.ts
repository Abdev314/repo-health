import { renderHeader } from "../components/Header";
import { renderStatCard } from "../components/StatCard";
import { renderRepositoryCard } from "../components/RepositoryCard";
import { renderAddRepositoryModal } from "../components/AddRepositoryModal";
import type { Repository } from "../types/repository";

const repository: Repository = {
  name: "repo-health",
  owner: "Abdev314",
  description:
    "A tool for checking GitHub repository activity, health and development signals.",
  language: "Python",
  stars: 12,
  forks: 2,
  issues: 3,
  pullRequests: 1,
  health: 85,
  activity: "active",
  ciStatus: "passing",
  latestRelease: "v1.2.0",
  defaultBranch: "main",
};

export function renderDashboard(): string {
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
            value: 1,
            description: "Currently monitored",
          })}

          ${renderStatCard({
            label: "Active",
            value: 1,
            description: "Active in the last 90 days",
          })}

          ${renderStatCard({
            label: "Average health",
            value: 85,
            description: "Across all repositories",
          })}

          ${renderStatCard({
            label: "Open issues",
            value: 3,
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

          ${renderRepositoryCard({ repository })}
        </section>
      </main>

      ${renderAddRepositoryModal()}
    </div>
  `;
}

export function getDashboardRepository(): Repository {
  return repository;
}