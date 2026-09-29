export type ToastType = "success" | "error" | "info";

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-slate-200 bg-white text-slate-700",
};

function ensureContainer(): HTMLElement {
  let container = document.querySelector<HTMLElement>("#toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className =
      "pointer-events-none fixed bottom-5 right-5 z-[60] flex w-80 max-w-[calc(100vw-2.5rem)] flex-col gap-2";
    document.body.appendChild(container);
  }

  return container;
}

export function showToast(
  message: string,
  type: ToastType = "info",
): void {
  const container = ensureContainer();
  const toast = document.createElement("div");

  toast.className = `pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 translate-y-2 opacity-0 ${STYLES[type]}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  window.setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");

    window.setTimeout(() => toast.remove(), 300);
  }, 3200);
}
