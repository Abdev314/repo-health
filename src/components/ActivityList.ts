import type { ActivityItem } from "../types/repository";

interface ActivityListProps {
  activities: ActivityItem[];
}

export function renderActivityList({
  activities,
}: ActivityListProps): string {
  return `
    <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <h2 class="text-base font-bold text-slate-900">
          Latest activity
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Recent repository events.
        </p>
      </div>

      <div class="mt-5 divide-y divide-slate-100">
        ${activities
          .map(
            (activity) => `
              <div class="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">
                  •
                </div>

                <div class="min-w-0">
                  <p class="text-sm font-semibold text-slate-700">
                    ${activity.title}
                  </p>

                  <p class="mt-1 text-sm text-slate-500">
                    ${activity.description}
                  </p>

                  <p class="mt-1 text-xs text-slate-400">
                    ${activity.time}
                  </p>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}