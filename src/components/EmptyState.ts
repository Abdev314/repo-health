import { icon } from "./icons";

interface EmptyStateProps {
  title: string;
  description: string;
  showAddButton?: boolean;
}

export function renderEmptyState({
  title,
  description,
  showAddButton = false,
}: EmptyStateProps): string {
  return `
    <div class="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
        ${icon("heart", "h-6 w-6")}
      </div>

      <h3 class="mt-4 text-sm font-semibold text-slate-700">
        ${title}
      </h3>

      <p class="mt-1 max-w-sm text-sm leading-6 text-slate-400">
        ${description}
      </p>

      ${
        showAddButton
          ? `
            <button
              data-action="open-add-modal"
              class="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.98]"
            >
              ${icon("plus", "h-4 w-4")}
              Add repository
            </button>
          `
          : ""
      }
    </div>
  `;
}
