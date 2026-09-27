export function renderAddRepositoryModal(): string {
  return `
    <div
      id="add-repository-modal"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/20 px-4 backdrop-blur-[2px]"
    >
      <div
        id="modal-backdrop"
        class="absolute inset-0"
      ></div>

      <div class="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              Add repository
            </h2>

            <p class="mt-1 text-sm leading-5 text-slate-500">
              Enter a public GitHub repository to monitor.
            </p>
          </div>

          <button
            id="close-modal-button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form id="add-repository-form" class="mt-6">
          <label
            for="repository-input"
            class="text-sm font-semibold text-slate-700"
          >
            Repository
          </label>

          <input
            id="repository-input"
            name="repository"
            type="text"
            placeholder="owner/repository"
            autocomplete="off"
            class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />

          <p
            id="repository-input-error"
            class="mt-2 hidden text-xs font-medium text-red-500"
          >
            Please enter a repository in owner/repository format.
          </p>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              id="cancel-modal-button"
              class="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Add repository
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function openAddRepositoryModal(): void {
  const modal = document.querySelector<HTMLElement>(
    "#add-repository-modal",
  );

  if (!modal) {
    return;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const input = document.querySelector<HTMLInputElement>(
    "#repository-input",
  );

  input?.focus();
}

export function closeAddRepositoryModal(): void {
  const modal = document.querySelector<HTMLElement>(
    "#add-repository-modal",
  );

  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

export function attachAddRepositoryModalEvents(
  onRepositoryAdded: (repository: string) => void,
): void {
  document
    .querySelector("#close-modal-button")
    ?.addEventListener("click", closeAddRepositoryModal);

  document
    .querySelector("#cancel-modal-button")
    ?.addEventListener("click", closeAddRepositoryModal);

  document
    .querySelector("#modal-backdrop")
    ?.addEventListener("click", closeAddRepositoryModal);

  document
    .querySelector("#add-repository-form")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = document.querySelector<HTMLInputElement>(
        "#repository-input",
      );

      const error = document.querySelector<HTMLElement>(
        "#repository-input-error",
      );

      if (!input || !error) {
        return;
      }

      const repository = input.value.trim();
      const valid = /^[^/\s]+\/[^/\s]+$/.test(repository);

      if (!valid) {
        error.classList.remove("hidden");
        input.focus();
        return;
      }

      error.classList.add("hidden");
      onRepositoryAdded(repository);
      input.value = "";
      closeAddRepositoryModal();
    });
}