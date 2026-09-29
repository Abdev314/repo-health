import {
  attachAddRepositoryModalEvents,
  closeAddRepositoryModal,
  openAddRepositoryModal,
  renderAddRepositoryModal,
} from "./components/AddRepositoryModal";
import {
  renderMobileBar,
  renderSidebar,
} from "./components/Sidebar";
import { showToast } from "./components/Toast";
import { renderDashboard } from "./pages/Dashboard";
import { renderRepositories } from "./pages/Repositories";
import { renderRepositoryDetails } from "./pages/RepositoryDetails";
import { fetchRepository } from "./services/github";
import {
  addRepository,
  getRepositories,
  getRepository,
  isMonitoring,
  removeRepository,
  updateRepository,
} from "./services/repositoryStore";
import type { View } from "./types/repository";

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("App root element was not found.");
}

const app = appElement;

let currentView: View = "dashboard";
let returnView: View = "dashboard";
let selectedRepositoryId: string | null = null;
let pendingRemoveId: string | null = null;
const refreshingIds = new Set<string>();

function navigate(view: View): void {
  currentView = view;
  pendingRemoveId = null;
  paint();
}

function render(): string {
  const repositories = getRepositories();
  const selected =
    selectedRepositoryId === null
      ? null
      : getRepository(selectedRepositoryId);

  if (currentView === "repository" && !selected) {
    currentView = "dashboard";
  }

  const page =
    currentView === "dashboard"
      ? renderDashboard({ repositories })
      : currentView === "repositories"
        ? renderRepositories({ repositories })
        : selected
          ? renderRepositoryDetails({
              repository: selected,
              isRefreshing: refreshingIds.has(selected.id),
              isConfirmingRemove: pendingRemoveId === selected.id,
            })
          : "";

  return `
    <div class="flex min-h-screen bg-[#f8f8f6] text-slate-900">
      ${renderSidebar({
        currentView,
        repositoryCount: repositories.length,
      })}

      <div class="flex min-w-0 flex-1 flex-col">
        ${renderMobileBar()}
        ${page}
      </div>
    </div>

    ${renderAddRepositoryModal()}
  `;
}

function paint(): void {
  app.innerHTML = render();
  attachAddRepositoryModalEvents(handleAddRepository);
}

async function handleAddRepository(fullName: string): Promise<void> {
  const [owner, name] = fullName.split("/");

  if (isMonitoring(fullName.toLowerCase())) {
    throw new Error("Repository is already being monitored.");
  }

  const repository = await fetchRepository(owner, name);

  addRepository(repository);
  showToast("Repository added successfully.", "success");
  paint();
}

async function refreshRepository(id: string): Promise<void> {
  if (refreshingIds.has(id)) {
    return;
  }

  const repository = getRepository(id);

  if (!repository) {
    return;
  }

  refreshingIds.add(id);
  paint();

  try {
    const updated = await fetchRepository(
      repository.owner,
      repository.name,
    );

    updateRepository(updated);
    showToast(
      `Refreshed ${updated.owner}/${updated.name}.`,
      "success",
    );
  } catch (error) {
    showToast(
      error instanceof Error
        ? error.message
        : "Could not refresh the repository.",
      "error",
    );
  } finally {
    refreshingIds.delete(id);
    paint();
  }
}

function confirmRemoveRepository(id: string): void {
  const repository = getRepository(id);

  if (!removeRepository(id)) {
    pendingRemoveId = null;
    paint();
    return;
  }

  showToast(
    `Removed ${repository ? `${repository.owner}/${repository.name}` : "repository"}.`,
    "info",
  );

  if (selectedRepositoryId === id && currentView === "repository") {
    selectedRepositoryId = null;
    currentView = "dashboard";
  }

  pendingRemoveId = null;
  paint();
}

function handleAction(target: HTMLElement): void {
  const action = target.dataset.action;
  const id = target.dataset.repositoryId ?? "";

  switch (action) {
    case "open-add-modal":
      openAddRepositoryModal();
      break;

    case "view":
      if (currentView !== "repository") {
        returnView = currentView;
      }

      selectedRepositoryId = id;
      navigate("repository");
      break;

    case "back":
      navigate(returnView);
      break;

    case "refresh":
      void refreshRepository(id);
      break;

    case "remove":
      pendingRemoveId = id;
      paint();
      break;

    case "cancel-remove":
      pendingRemoveId = null;
      paint();
      break;

    case "confirm-remove":
      confirmRemoveRepository(id);
      break;
  }
}

document.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>(
    "[data-action]",
  );

  if (target) {
    handleAction(target);
    return;
  }

  const nav = (event.target as HTMLElement).closest<HTMLElement>(
    "[data-nav]",
  );

  const view = nav?.dataset.nav;

  if (view === "dashboard" || view === "repositories") {
    navigate(view);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeAddRepositoryModal();
});

paint();
