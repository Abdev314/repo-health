import type { View } from "../types/repository";

interface SidebarProps {
  currentView: View;
}

export function renderSidebar({
  currentView,
}: SidebarProps): string {
  const dashboardActive = currentView === "dashboard";
  const repositoryActive = currentView === "repository";

  return `
    <aside class="flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/80 px-4 py-5">
      <div class="mb-8 flex items-center gap-3 px-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          RH
        </div>

        <div>
          <p class="text-sm font-bold text-slate-900">Repo Health</p>
          <p class="text-xs text-slate-400">Repository insights</p>
        </div>
      </div>

      <nav class="space-y-1">
        <button
          data-nav="dashboard"
          class="${
            dashboardActive
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          } flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
        >
          <span>⌂</span>
          Dashboard
        </button>

        <button
          data-nav="repository"
          class="${
            repositoryActive
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          } flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
        >
          <span>◫</span>
          Repositories
        </button>

        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <span>⚙</span>
          Settings
        </button>
      </nav>

      <div class="mt-auto rounded-2xl bg-slate-50 p-4">
        <p class="text-xs font-semibold text-slate-500">
          Repository health
        </p>

        <p class="mt-1 text-xs leading-5 text-slate-400">
          Monitor activity, issues, releases and CI status.
        </p>
      </div>
    </aside>
  `;
}

export function attachSidebarEvents(
  container: HTMLElement,
  onNavigate: (view: View) => void,
): void {
  container.querySelectorAll<HTMLElement>("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.nav;

      if (view === "dashboard" || view === "repository") {
        onNavigate(view);
      }
    });
  });
}