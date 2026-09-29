import { icon } from "./icons";

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  iconName:
    | "folder"
    | "activity"
    | "heart"
    | "alert"
    | "git-pull-request"
    | "star"
    | "fork"
    | "x-circle";
  valueClass?: string;
}

export function renderStatCard({
  label,
  value,
  description,
  iconName,
  valueClass,
}: StatCardProps): string {
  return `
    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-500">
          ${label}
        </p>

        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
          ${icon(iconName, "h-4 w-4")}
        </span>
      </div>

      <p class="mt-3 text-2xl font-bold tracking-tight ${valueClass ?? "text-slate-900"}">
        ${value}
      </p>

      <p class="mt-1 text-xs text-slate-400">
        ${description}
      </p>
    </div>
  `;
}
