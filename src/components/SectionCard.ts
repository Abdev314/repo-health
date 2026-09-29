interface SectionCardProps {
  title: string;
  subtitle?: string;
  actionHtml?: string;
  bodyHtml: string;
}

export function renderSectionCard({
  title,
  subtitle,
  actionHtml,
  bodyHtml,
}: SectionCardProps): string {
  return `
    <section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900">
            ${title}
          </h2>

          ${
            subtitle
              ? `<p class="mt-0.5 text-xs text-slate-400">${subtitle}</p>`
              : ""
          }
        </div>

        ${actionHtml ?? ""}
      </div>

      ${bodyHtml}
    </section>
  `;
}
