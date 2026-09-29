# Repo Health

Monitor the health of your GitHub repositories: activity, open issues,
pull requests, CI status and releases — in a clean web dashboard.

![Stack](https://img.shields.io/badge/stack-TypeScript%20%2B%20Vite%20%2B%20Tailwind%20%2B%20Flask-0f172a)

## Features

- **Multi-repository dashboard** — add, refresh and remove any number of
  public GitHub repositories.
- **Transparent health score (0–100)** — built from five categories
  (activity, issues, pull requests, CI, releases) with a per-category
  breakdown and explanation.
- **Real data only** — every metric comes from the GitHub REST API via the
  Flask backend; the UI shows sensible fallbacks ("Unknown",
  "No recent activity") when GitHub has no data.
- **Persistence** — monitored repositories survive browser refreshes via
  `localStorage` (never the token).
- **Installable PWA** — web app manifest and generated icons; install it
  from the browser for a standalone, app-like window.
- **Original CLI tool** — `cli/repo_health.py` still works on its own.

## Architecture

```text
Browser (TypeScript + Vite + Tailwind)
   ↓  HTTP (JSON, no secrets)
Flask API  (cli/server/)
   ↓  HTTPS (GitHub REST API, token stays server-side)
GitHub
```

The GitHub token **never** reaches the frontend: it lives only in the
Flask process environment or in the ignored `cli/tk.txt` file.

```text
cli/server/
├── server.py          # Flask routes only
├── github_client.py   # GitHub API communication + token handling + errors
├── repositories.py    # fetching and normalizing repository payloads
└── health.py          # activity status and health-score calculation
```

### Health score

| Category      | Max | Based on                                              |
| ------------- | --- | ----------------------------------------------------- |
| Activity      | 17  | Date of the latest commit                             |
| Issues        | 16  | Number of open issues (PRs excluded)                  |
| Pull requests | 10  | Number of open pull requests                          |
| CI            | 16  | Latest GitHub Actions run (unknown scores neutrally)  |
| Releases      | 14  | Most recent release and its age                       |
| Bus factor    | 12  | Contributor concentration (see below)                 |
| Triage        | 15  | Age of open issues and pull requests (see below)      |

The bus factor category measures how widely knowledge is spread among
contributors: the *bus factor* is the smallest number of top contributors
whose commits sum to at least half of all commits, and the *top contributor
share* is the percentage of commits owned by the number-one contributor.
A bus factor of 3 or more scores full points, a bus factor of 2 scores 8,
and a single dominant contributor (share ≥ 70%) scores 0. If GitHub cannot
provide contributor data (for example when a repository's history is too
large to list), the category scores a neutral 6 out of 12.

The triage category measures how long open issues and pull requests have
been waiting: it is driven by the *median age* of all open items. A median
age of 30 days or less scores full points, up to 60 days scores 10, up to
90 days scores 5, and older backlogs score 0. Repositories without any open
issues or pull requests also score full points.

## Prerequisites

- Python 3.10+
- Node.js 20+ and npm
- A GitHub personal access token (classic token with `public_repo` or a
  fine-grained token with read access to public repositories is enough)

## Installation

```bash
# Python dependencies (Flask backend)
pip install -r cli/requirements.txt

# JavaScript dependencies (frontend)
npm install
```

## GitHub token setup

Choose one (the token is read server-side only):

1. **Environment variable** (preferred — takes priority):

   ```bash
   export GITHUB_TOKEN=ghp_your_token_here
   ```

2. **Token file**: put the token in `cli/tk.txt` (a single line).

`cli/tk.txt`, `.env*` and virtual environments are already in
`.gitignore`. **Never commit a real token.**

## Running the app (development)

Terminal 1 — Flask backend:

```bash
python cli/server/server.py
```

Serves the API on <http://127.0.0.1:5000>.

Terminal 2 — Vite dev server:

```bash
npm run dev
```

Open the printed URL (default <http://localhost:5173>).

## Production build

```bash
npm run build      # type-check + bundle to dist/
npm run preview    # serve the production build locally
```

## CLI usage (original tool)

The CLI on `main` is kept on this branch as well:

```bash
python cli/repo_health.py owner/repository
python cli/repo_health.py --file repositories.txt
```

## API

| Endpoint                              | Description                              |
| ------------------------------------- | ---------------------------------------- |
| `GET /api/health`                     | Backend health check                     |
| `GET /api/repositories/<owner>/<repo>`| Normalized repository data + health      |

Error responses are JSON with a friendly `error` message and a matching
HTTP status: `400` invalid name, `404` repository not found, `429` GitHub
rate limit, `5xx` upstream/network failures. Token details are never
included.

## Security notes

- The token is only read by `cli/server/github_client.py`, never sent to
  the browser or stored in `localStorage`.
- All GitHub strings are HTML-escaped before being rendered.
- Regenerate icons with `node scripts/generate-icons.mjs` if needed.

## Branches

- `main` — original Python CLI version.
- `web` — web application (default branch, deployed from here).

The web app is intentionally **not** merged into `main`.
