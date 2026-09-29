import { icon } from "./icons";
import type { IconName } from "./icons";
import { escapeHtml, formatRelativeTime } from "../utils/format";
import type { ActivityItem, ActivityType } from "../types/repository";

interface ActivityListProps {
  activities: ActivityItem[];
}

const TYPE_ICONS: Record<ActivityType, IconName> = {
  commit: "activity",
  release: "star",
  ci: "check-circle",
};

export function renderActivityList({
  activities,
}: ActivityListProps): string {
  const body = activities.length
    ? `
      <div class="divide-y divide-slate-100">
        ${activities
          .map(
            (activity) => `
              <div class="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  ${icon(TYPE_ICONS[activity.type] ?? "activity", "h-3.5 w-3.5")}
                </div>

                <div class="min-w-0">
                  <p class="break-words text-sm font-semibold text-slate-700">
                    ${escapeHtml(activity.title)}
                  </p>

                  <p class="mt-1 text-sm text-slate-500">
                    ${escapeHtml(activity.description)}
                  </p>

                  <p class="mt-1 text-xs text-slate-400">
                    ${formatRelativeTime(activity.time)}
                  </p>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    `
    : `
      <div class="py-6 text-center">
        <p class="text-sm font-medium text-slate-500">No recent activity</p>
        <p class="mt-1 text-xs text-slate-400">GitHub has not reported any recent events for this repository.</p>
      </div>
    `;

  return `
    <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <h2 class="text-base font-bold text-slate-900">
          Latest activity
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Recent repository events from GitHub.
        </p>
      </div>

      <div class="mt-5">${body}</div>
    </section>
  `;
}
