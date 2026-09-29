"""Fetching and normalizing repository data for the API."""

from github_client import github_request, github_request_optional
from health import build_health_summary, is_active


def get_commits(owner, repository):
    commits = github_request(
        f"/repos/{owner}/{repository}/commits?per_page=5"
    )

    activities = []

    for commit in commits:
        message = commit["commit"]["message"].splitlines()[0]
        author = commit["commit"]["author"]["name"]

        activities.append(
            {
                "type": "commit",
                "title": message[:80],
                "description": f"{author} committed",
                "time": commit["commit"]["author"]["date"],
            }
        )

    latest_commit_date = (
        commits[0]["commit"]["author"]["date"] if commits else None
    )

    return latest_commit_date, activities


def get_latest_release(owner, repository):
    release = github_request_optional(
        f"/repos/{owner}/{repository}/releases/latest"
    )

    if not release:
        return None, None

    return release["tag_name"], release.get("published_at")


def get_ci_status(owner, repository):
    workflows = github_request_optional(
        f"/repos/{owner}/{repository}/actions/runs?per_page=1"
    )

    if not workflows:
        return "unknown", None

    runs = workflows.get("workflow_runs", [])

    if not runs:
        return "unknown", None

    run = runs[0]

    if run.get("conclusion") == "success":
        status = "passing"
    elif run.get("conclusion") in {"failure", "cancelled", "timed_out"}:
        status = "failing"
    else:
        status = "unknown"

    return status, run


def build_recent_activity(commits, latest_release, release_published_at,
                          latest_run):
    activities = list(commits)

    if latest_release:
        activities.append(
            {
                "type": "release",
                "title": f"Release {latest_release}",
                "description": "A new version was published",
                "time": release_published_at,
            }
        )

    if latest_run:
        conclusion = latest_run.get("conclusion") or "in progress"
        activities.append(
            {
                "type": "ci",
                "title": f"Workflow {latest_run.get('name', 'run')} {conclusion}",
                "description": "Latest GitHub Actions run",
                "time": latest_run.get("updated_at"),
            }
        )

    activities = [item for item in activities if item.get("time")]
    activities.sort(key=lambda item: item["time"], reverse=True)

    return activities[:6]


def build_repository_payload(owner, repository):
    data = github_request(f"/repos/{owner}/{repository}")
    pulls = github_request(
        f"/repos/{owner}/{repository}/pulls?state=open&per_page=100"
    )
    latest_commit_date, commit_activity = get_commits(owner, repository)
    latest_release, release_published_at = get_latest_release(
        owner, repository
    )
    ci_status, latest_run = get_ci_status(owner, repository)

    # GitHub counts open pull requests inside open_issues_count.
    pull_request_count = len(pulls)
    open_issues = max(data["open_issues_count"] - pull_request_count, 0)

    activity = is_active(latest_commit_date)

    health, health_breakdown = build_health_summary(
        latest_commit_date,
        open_issues,
        pull_request_count,
        ci_status,
        latest_release,
        release_published_at,
    )

    return {
        "id": f"{data['owner']['login']}/{data['name']}".lower(),
        "name": data["name"],
        "owner": data["owner"]["login"],
        "description": data["description"] or "",
        "language": data["language"] or "Unknown",
        "stars": data["stargazers_count"],
        "forks": data["forks_count"],
        "issues": open_issues,
        "pullRequests": pull_request_count,
        "health": health,
        "healthBreakdown": health_breakdown,
        "activity": activity,
        "ciStatus": ci_status,
        "latestRelease": latest_release,
        "defaultBranch": data["default_branch"],
        "recentActivity": build_recent_activity(
            commit_activity,
            latest_release,
            release_published_at,
            latest_run,
        ),
    }
