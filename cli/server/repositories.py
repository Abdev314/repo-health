"""Fetching and normalizing repository data for the API."""

from github_client import GitHubError, github_request, github_request_optional
from health import build_health_summary, days_since, is_active


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


def get_contributors(owner, repository):
    """Contributor concentration stats, or None when unavailable.

    The contributors endpoint returns 403 for repositories whose
    history is too large; in that case (or when the list is empty)
    the caller scores the category neutrally.
    """

    try:
        contributors = github_request(
            f"/repos/{owner}/{repository}/contributors?per_page=100"
        )
    except GitHubError:
        return None

    if not contributors:
        return None

    total = sum(c.get("contributions", 0) for c in contributors)
    active = sum(1 for c in contributors if c.get("contributions", 0) > 0)

    if total <= 0 or active == 0:
        return None

    ranked = sorted(
        contributors,
        key=lambda c: c["contributions"],
        reverse=True,
    )

    top_share = round(ranked[0]["contributions"] / total * 100)

    # Bus factor: smallest number of top contributors whose commits
    # sum to at least half of all commits.
    cumulative = 0
    bus_factor = 0

    for contributor in ranked:
        cumulative += contributor["contributions"]
        bus_factor += 1

        if cumulative >= total * 0.5:
            break

    return {
        "bus_factor": bus_factor,
        "top_share": top_share,
        "top_login": ranked[0].get("login"),
    }


def get_triage_signals(issues, pulls):
    """Age statistics for the combined set of open issues and PRs."""

    items = [
        {
            "type": "issue",
            "title": issue.get("title") or "Untitled issue",
            "age": days_since(issue["created_at"]),
        }
        for issue in issues
    ] + [
        {
            "type": "pull_request",
            "title": pull.get("title") or "Untitled pull request",
            "age": days_since(pull["created_at"]),
        }
        for pull in pulls
    ]

    if not items:
        return {
            "openItemCount": 0,
            "medianAgeDays": 0,
            "stale30Percent": 0,
            "stale90Percent": 0,
            "oldestAgeDays": 0,
            "oldestItemType": None,
            "oldestItemTitle": None,
        }

    ages = sorted(item["age"] for item in items)
    count = len(ages)
    middle = count // 2

    if count % 2:
        median = ages[middle]
    else:
        median = (ages[middle - 1] + ages[middle]) / 2

    oldest = max(items, key=lambda item: item["age"])

    return {
        "openItemCount": count,
        "medianAgeDays": round(median, 1),
        "stale30Percent": round(
            sum(1 for age in ages if age > 30) / count * 100, 1
        ),
        "stale90Percent": round(
            sum(1 for age in ages if age > 90) / count * 100, 1
        ),
        "oldestAgeDays": oldest["age"],
        "oldestItemType": oldest["type"],
        "oldestItemTitle": oldest["title"],
    }


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
    contributors = get_contributors(owner, repository)
    latest_release, release_published_at = get_latest_release(
        owner, repository
    )
    ci_status, latest_run = get_ci_status(owner, repository)

    # GitHub's /issues endpoint also returns pull requests; filter them
    # out so the combined triage dataset does not count PRs twice.
    try:
        open_items = github_request(
            f"/repos/{owner}/{repository}/issues"
            "?state=open&per_page=100"
        )
        open_issues_only = [
            item for item in open_items if "pull_request" not in item
        ]
        triage = get_triage_signals(open_issues_only, pulls)
    except GitHubError:
        triage = None

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
        bus_factor=contributors["bus_factor"] if contributors else None,
        top_contributor_share=contributors["top_share"] if contributors else None,
        top_contributor_login=contributors["top_login"] if contributors else None,
        triage=triage,
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
        "busFactor": contributors["bus_factor"] if contributors else None,
        "topContributorShare": (
            contributors["top_share"] if contributors else None
        ),
        "triage": triage,
    }
