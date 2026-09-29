import { renderHeader } from "../components/Header";
import { renderRepositoryCard } from "../components/RepositoryCard";
import { renderEmptyState } from "../components/EmptyState";
import { formatNumber } from "../utils/format";
import type { Repository } from "../types/repository";

interface RepositoriesProps {
  repositories: Repository[];
}

export function renderRepositories({
  repositories,
}: RepositoriesProps): string {
  return `
    <div>
      ${renderHeader({
        title: "Repositories",
        subtitle:
          repositories.length === 1
            ? "1 repository monitored."
            : `${formatNumber(repositories.length)} repositories monitored.`,
        showAddButton: true,
      })}

      <main class="p-6 lg:p-8">
        ${
          repositories.length
            ? `
              <div class="grid gap-4 xl:grid-cols-2">
                ${repositories
                  .map((repository) => renderRepositoryCard({ repository }))
                  .join("")}
              </div>
            `
            : renderEmptyState({
                title: "No repositories monitored yet.",
                description:
                  "Add your first GitHub repository to start tracking its health.",
                showAddButton: true,
              })
        }
      </main>
    </div>
  `;
}
