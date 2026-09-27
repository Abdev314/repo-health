import {
  attachAddRepositoryModalEvents,
  openAddRepositoryModal,
} from "./components/AddRepositoryModal";
import {
  attachSidebarEvents,
  renderSidebar,
} from "./components/Sidebar";
import { renderDashboard } from "./pages/Dashboard";
import { renderRepositoryDetails } from "./pages/RepositoryDetails";
import type { Repository, View } from "./types/repository";

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("App root element was not found.");
}

const app = appElement;

let currentView: View = "dashboard";

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

function navigate(view: View): void {
  currentView = view;
  render();
}

function render(): void {
  const page =
    currentView === "dashboard"
      ? renderDashboard()
      : renderRepositoryDetails({ repository });

  app.innerHTML = `
    <div class="flex min-h-screen bg-[#f8f8f6] text-slate-900">
      <div id="sidebar">
        ${renderSidebar({ currentView })}
      </div>

      <div class="min-w-0 flex-1">
        ${page}
      </div>
    </div>
  `;

  attachEvents();
}

function attachEvents(): void {
  const sidebar = document.querySelector<HTMLElement>("#sidebar");

  if (sidebar) {
    attachSidebarEvents(sidebar, navigate);
  }

  if (currentView === "dashboard") {
    document
      .querySelector("#add-repository-button")
      ?.addEventListener("click", openAddRepositoryModal);

    document
      .querySelector("[data-repository-card]")
      ?.addEventListener("click", () => {
        navigate("repository");
      });

    attachAddRepositoryModalEvents((repositoryName) => {
      console.log("Repository to add:", repositoryName);
    });
  }

  if (currentView === "repository") {
    document
      .querySelector("#back-to-dashboard")
      ?.addEventListener("click", () => {
        navigate("dashboard");
      });
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const modal = document.querySelector<HTMLElement>(
    "#add-repository-modal",
  );

  if (modal && !modal.classList.contains("hidden")) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
});

render();