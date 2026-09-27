interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
}

export function renderStatCard({
  label,
  value,
  description,
}: StatCardProps): string {
  return `
    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <p class="text-sm font-medium text-slate-500">
        ${label}
      </p>

      <p class="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        ${value}
      </p>

      <p class="mt-1 text-xs text-slate-400">
        ${description}
      </p>
    </div>
  `;
}