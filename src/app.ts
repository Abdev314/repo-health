const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="min-h-screen bg-[#f7f8fc] text-slate-800">
    <div class="flex min-h-screen">

      <!-- Sidebar -->
      <aside class="hidden w-64 shrink-0 border-r border-slate-200/70 bg-white/80 p-5 backdrop-blur-sm lg:block">
        <div class="flex h-full flex-col">

          <div class="flex items-center gap-3 px-2">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
              RH
            </div>

            <div>
              <h1 class="font-bold tracking-tight">Repo Health</h1>
              <p class="text-xs text-slate-400">Repository insights</p>
            </div>
          </div>

          <nav class="mt-10 space-y-2">
            <a
              href="#"
              class="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800"
            >
              <span>⌂</span>
              Dashboard
            </a>

            <a
              href="#"
              class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <span>◫</span>
              Repositories
            </a>

            <a
              href="#"
              class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <span>⚙</span>
              Settings
            </a>
          </nav>

          <div class="mt-auto rounded-3xl bg-slate-50 p-4">
            <p class="text-xs font-semibold text-slate-500">
              Repository Health
            </p>

            <p class="mt-1 text-xs leading-5 text-slate-400">
              Keep track of your projects from one simple place.
            </p>
          </div>

        </div>
      </aside>

      <!-- Main -->
      <main class="min-w-0 flex-1">

        <!-- Header -->
        <header class="border-b border-slate-200/70 bg-white/70 px-5 py-4 backdrop-blur-sm sm:px-8 sm:py-5">
          <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">

            <div class="flex items-center gap-3">

              <button
                class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
                aria-label="Open navigation"
              >
                ☰
              </button>

              <div>
                <p class="text-sm text-slate-400">
                  Dashboard
                </p>

                <h2 class="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  Your repositories
                </h2>
              </div>

            </div>

            <button
              data-open-modal
              class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-5"
            >
              <span class="sm:hidden">+</span>
              <span class="hidden sm:inline">+ Add repository</span>
            </button>

          </div>
        </header>

        <!-- Content -->
        <section class="mx-auto max-w-7xl px-6 py-8 sm:px-8">

          <!-- Stats -->
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div class="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <p class="text-sm text-slate-400">
                Repositories
              </p>

              <p class="mt-3 text-3xl font-bold">
                1
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Currently monitored
              </p>
            </div>

            <div class="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <p class="text-sm text-slate-400">
                Active
              </p>

              <p class="mt-3 text-3xl font-bold">
                1
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Recently updated
              </p>
            </div>

            <div class="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <p class="text-sm text-slate-400">
                Average health
              </p>

              <p class="mt-3 text-3xl font-bold">
                85
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Across repositories
              </p>
            </div>

            <div class="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <p class="text-sm text-slate-400">
                Issues
              </p>

              <p class="mt-3 text-3xl font-bold">
                3
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Open issues
              </p>
            </div>

          </div>

          <!-- Repository section -->
          <div class="mt-8">

            <div class="mb-4 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold">
                  Repositories
                </h3>

                <p class="mt-1 text-sm text-slate-400">
                  Monitor the health of your projects.
                </p>
              </div>

              <button
                class="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 sm:block"
              >
                View all
              </button>
            </div>

            <!-- Repository Card -->
            <div class="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

              <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div class="flex min-w-0 items-start gap-4">

                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                    ◫
                  </div>

                  <div class="min-w-0">

                    <div class="flex flex-wrap items-center gap-2">

                      <h4 class="truncate text-lg font-bold">
                        Abdev314 / repo-health
                      </h4>

                      <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        Active
                      </span>

                    </div>

                    <p class="mt-1 text-sm text-slate-400">
                      GitHub repository health monitoring tool
                    </p>

                  </div>

                </div>

                <button
                  class="self-start rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                >
                  View details
                </button>

              </div>

              <!-- Metrics -->
              <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <div class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs font-medium text-slate-400">
                    Health
                  </p>

                  <div class="mt-2 flex items-end gap-1">
                    <span class="text-2xl font-bold">
                      85
                    </span>

                    <span class="mb-1 text-xs text-slate-400">
                      /100
                    </span>
                  </div>
                </div>

                <div class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs font-medium text-slate-400">
                    Open issues
                  </p>

                  <p class="mt-2 text-2xl font-bold">
                    3
                  </p>
                </div>

                <div class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs font-medium text-slate-400">
                    Pull requests
                  </p>

                  <p class="mt-2 text-2xl font-bold">
                    1
                  </p>
                </div>

                <div class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs font-medium text-slate-400">
                    CI
                  </p>

                  <div class="mt-2 flex items-center gap-2">
                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>

                    <span class="text-sm font-semibold text-emerald-600">
                      Passing
                    </span>
                  </div>
                </div>

              </div>

              <!-- Footer -->
              <div class="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                <div class="flex flex-wrap gap-x-5 gap-y-2">
                  <span>Python</span>
                  <span>★ 12</span>
                  <span>Forks 2</span>
                </div>

                <span>
                  Updated 2 hours ago
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>

    <!-- Add Repository Modal -->
    <div
      id="repository-modal"
      class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm"
    >

      <div
        id="modal-panel"
        class="w-full max-w-lg rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-2xl sm:p-8"
      >

        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-4">

          <div>
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg">
              ◫
            </div>

            <h3 class="mt-5 text-xl font-bold tracking-tight">
              Add repository
            </h3>

            <p class="mt-2 text-sm leading-6 text-slate-400">
              Add a GitHub repository to start monitoring its health.
            </p>
          </div>

          <button
            data-close-modal
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            ×
          </button>

        </div>

        <!-- Form -->
        <form class="mt-7">

          <label
            for="repository"
            class="text-sm font-semibold text-slate-700"
          >
            GitHub repository
          </label>

          <div class="mt-2">

            <input
              id="repository"
              name="repository"
              type="text"
              placeholder="owner/repository"
              autocomplete="off"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />

          </div>

          <p class="mt-2 text-xs leading-5 text-slate-400">
            Example:
            <span class="font-medium text-slate-500">
              Abdev314/repo-health
            </span>
          </p>

          <!-- Modal Actions -->
          <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              data-close-modal
              class="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Add repository
            </button>

          </div>

        </form>

      </div>

    </div>

  </div>
`;

/*
 * Modal behavior
 */

const modal = document.querySelector<HTMLDivElement>("#repository-modal");
const modalPanel = document.querySelector<HTMLDivElement>("#modal-panel");

const openModalButtons =
  document.querySelectorAll<HTMLButtonElement>("[data-open-modal]");

const closeModalButtons =
  document.querySelectorAll<HTMLButtonElement>("[data-close-modal]");

function openModal() {
  if (!modal || !modalPanel) {
    return;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  modalPanel.classList.add("animate-[modal-in_0.2s_ease-out]");
}

function closeModal() {
  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

openModalButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});