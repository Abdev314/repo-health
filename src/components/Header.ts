import { icon } from "./icons";

interface HeaderProps {
  title: string;
  subtitle: string;
  showAddButton?: boolean;
}

export function renderHeader({
  title,
  subtitle,
  showAddButton = false,
}: HeaderProps): string {
  return `
    <header class="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/50 px-6 py-5 lg:px-8">
      <div class="min-w-0">
        <h1 class="text-xl font-bold tracking-tight text-slate-900">
          ${title}
        </h1>

        <p class="mt-1 truncate text-sm text-slate-500">
          ${subtitle}
        </p>
      </div>

      ${
        showAddButton
          ? `
            <button
              data-action="open-add-modal"
              class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              ${icon("plus", "h-4 w-4")}
              <span class="hidden sm:inline">Add repository</span>
              <span class="sm:hidden">Add</span>
            </button>
          `
          : ""
      }
    </header>
  `;
}
