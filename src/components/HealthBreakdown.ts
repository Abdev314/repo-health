import type { HealthMetric } from "../types/repository";

interface HealthBreakdownProps {
  metrics: HealthMetric[];
}

function barColor(ratio: number): string {
  if (ratio >= 0.75) {
    return "bg-emerald-500";
  }

  if (ratio >= 0.4) {
    return "bg-amber-500";
  }

  return "bg-rose-500";
}

export function renderHealthBreakdown({
  metrics,
}: HealthBreakdownProps): string {
  return `
    <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div>
        <h2 class="text-base font-bold text-slate-900">
          Health breakdown
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          How the repository health score is calculated.
        </p>
      </div>

      <div class="mt-6 space-y-5">
        ${metrics
          .map((metric) => {
            const ratio = metric.maxScore > 0 ? metric.score / metric.maxScore : 0;

            return `
              <div>
                <div class="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-slate-700">
                      ${metric.label}
                    </p>

                    <p class="mt-0.5 text-xs text-slate-400">
                      ${metric.description}
                    </p>
                  </div>

                  <span class="shrink-0 text-sm font-bold text-slate-700">
                    ${metric.score}/${metric.maxScore}
                  </span>
                </div>

                <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full ${barColor(ratio)} transition-all"
                    style="width: ${ratio * 100}%"
                  ></div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}
