import { icon } from "./icons";

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

      <div class="modal-panel relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl">
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
            class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ${icon("x", "h-4 w-4")}
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
            spellcheck="false"
            class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />

          <p
            id="repository-input-error"
            class="mt-2 hidden text-xs font-medium text-rose-500"
          ></p>

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
              class="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span id="add-submit-label">Add repository</span>
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
  onRepositoryAdded: (repository: string) => Promise<void>,
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
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const input = document.querySelector<HTMLInputElement>(
        "#repository-input",
      );

      const error = document.querySelector<HTMLElement>(
        "#repository-input-error",
      );

      const submitButton =
        document.querySelector<HTMLButtonElement>(
          '#add-repository-form button[type="submit"]',
        );

      const submitLabel = document.querySelector<HTMLElement>(
        "#add-submit-label",
      );

      if (!input || !error || !submitButton || !submitLabel) {
        return;
      }

      const repository = input.value.trim();
      const valid = /^[^/\s]+\/[^/\s]+$/.test(repository);

      if (!valid) {
        error.textContent =
          "Please enter a repository in owner/repository format.";

        error.classList.remove("hidden");
        input.focus();

        return;
      }

      error.classList.add("hidden");

      submitButton.disabled = true;
      submitLabel.textContent = "Checking...";

      try {
        await onRepositoryAdded(repository);

        input.value = "";
        closeAddRepositoryModal();
      } catch (requestError) {
        error.textContent =
          requestError instanceof Error && requestError.message
            ? requestError.message
            : "Repository could not be found. Please check the name and try again.";

        error.classList.remove("hidden");
        input.focus();
      } finally {
        submitButton.disabled = false;
        submitLabel.textContent = "Add repository";
      }
    });
}
