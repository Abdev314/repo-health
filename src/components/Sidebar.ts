import { icon } from "./icons";
import type { IconName } from "./icons";
import type { View } from "../types/repository";

interface SidebarProps {
  currentView: View;
  repositoryCount: number;
}

interface NavItem {
  view: View;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { view: "dashboard", label: "Dashboard", icon: "home" },
  { view: "repositories", label: "Repositories", icon: "folder" },
];

export function renderSidebar({
  currentView,
  repositoryCount,
}: SidebarProps): string {
  const activeView =
    currentView === "repository" ? "repositories" : currentView;

  return `
    <aside class="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/80 px-4 py-5 lg:flex">
      <div class="mb-8 flex items-center gap-3 px-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          ${icon("heart", "h-5 w-5")}
        </div>

        <div>
          <p class="text-sm font-bold text-slate-900">Repo Health</p>
          <p class="text-xs text-slate-400">Repository insights</p>
        </div>
      </div>

      <nav class="space-y-1">
        ${NAV_ITEMS.map((item) => {
          const active = activeView === item.view;

          return `
            <button
              data-nav="${item.view}"
              class="${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              } flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
            >
              ${icon(item.icon, "h-4 w-4")}
              ${item.label}

              ${
                item.view === "repositories" && repositoryCount > 0
                  ? `<span class="ml-auto rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-bold text-slate-600">${repositoryCount}</span>`
                  : ""
              }
            </button>
          `;
        }).join("")}
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

export function renderMobileBar(): string {
  return `
    <div class="sticky top-0 z-30 flex items-center border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          ${icon("heart", "h-4 w-4")}
        </div>

        <p class="text-sm font-bold text-slate-900">Repo Health</p>
      </div>
    </div>
  `;
}
