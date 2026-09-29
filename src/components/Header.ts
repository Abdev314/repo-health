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
    <header class="flex flex-col gap-4 border-b border-slate-200/70 bg-white/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-slate-900">
          ${title}
        </h1>

        <p class="mt-1 text-sm text-slate-500">
          ${subtitle}
        </p>
      </div>

      ${
        showAddButton
          ? `
            <button
              data-action="open-add-modal"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              ${icon("plus", "h-4 w-4")}
              Add repository
            </button>
          `
          : ""
      }
    </header>
  `;
}
