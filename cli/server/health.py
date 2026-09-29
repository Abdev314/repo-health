"""Repository health scoring.

The health score is a simple, transparent 0-100 number made of seven
categories. Every category reports its own score, maximum and a
human-readable explanation so the UI can show exactly where the
number comes from. Metrics that cannot be determined (for example a
repository without workflow runs) score neutrally instead of being
treated as healthy or unhealthy.
"""

from datetime import datetime, timezone

MAX_ACTIVITY = 17
MAX_ISSUES = 16
MAX_PULL_REQUESTS = 10
MAX_CI = 16
MAX_RELEASE = 14
MAX_BUS_FACTOR = 12
MAX_TRIAGE = 15

_ACTIVE_DAYS = 90


def days_since(date_string):
    date = datetime.fromisoformat(date_string.replace("Z", "+00:00"))
    delta = datetime.now(timezone.utc) - date

    return delta.days


def describe_days(days):
    if days <= 0:
        return "today"
    if days == 1:
        return "yesterday"

    return f"{days} days ago"


def is_active(latest_commit_date):
    if not latest_commit_date:
        return "inactive"

    return "active" if days_since(latest_commit_date) <= _ACTIVE_DAYS else "inactive"


def activity_metric(latest_commit_date):
    if not latest_commit_date:
        return {
            "label": "Activity",
            "score": 0,
            "maxScore": MAX_ACTIVITY,
            "description": "No commits could be retrieved",
        }

    days = days_since(latest_commit_date)

    if days <= 30:
        score = MAX_ACTIVITY
    elif days <= _ACTIVE_DAYS:
        score = 12
    elif days <= 180:
        score = 5
    else:
        score = 0

    return {
        "label": "Activity",
        "score": score,
        "maxScore": MAX_ACTIVITY,
        "description": f"Last commit {describe_days(days)}",
    }


def issues_metric(open_issues):
    if open_issues == 0:
        score = MAX_ISSUES
    elif open_issues <= 5:
        score = 12
    elif open_issues <= 15:
        score = 6
    else:
        score = 2

    return {
        "label": "Issues",
        "score": score,
        "maxScore": MAX_ISSUES,
        "description": f"{open_issues} open issues",
    }


def pull_requests_metric(open_pull_requests):
    if open_pull_requests == 0:
        score = MAX_PULL_REQUESTS
    elif open_pull_requests <= 3:
        score = 7
    elif open_pull_requests <= 10:
        score = 3
    else:
        score = 0

    return {
        "label": "Pull requests",
        "score": score,
        "maxScore": MAX_PULL_REQUESTS,
        "description": f"{open_pull_requests} open pull requests",
    }


def ci_metric(ci_status):
    descriptions = {
        "passing": "Latest workflow run passed",
        "failing": "Latest workflow run failed",
        "unknown": "No recent workflow runs to evaluate",
    }

    scores = {"passing": MAX_CI, "failing": 0, "unknown": MAX_CI // 2}

    return {
        "label": "CI",
        "score": scores[ci_status],
        "maxScore": MAX_CI,
        "description": descriptions[ci_status],
    }


def release_metric(latest_release, published_at):
    if not latest_release:
        return {
            "label": "Releases",
            "score": 0,
            "maxScore": MAX_RELEASE,
            "description": "No releases published",
        }

    if not published_at:
        score = MAX_RELEASE // 2
        description = f"Latest release {latest_release}"
    else:
        days = days_since(published_at)

        if days <= 365:
            score = MAX_RELEASE
        else:
            score = MAX_RELEASE // 2

        description = f"Latest release {latest_release} ({describe_days(days)})"

    return {
        "label": "Releases",
        "score": score,
        "maxScore": MAX_RELEASE,
        "description": description,
    }


def bus_factor_metric(bus_factor, top_contributor_share, top_contributor_login):
    if bus_factor is None:
        return {
            "label": "Bus factor",
            "score": 6,
            "maxScore": MAX_BUS_FACTOR,
            "description": "Contributor data unavailable",
        }

    if bus_factor >= 3:
        return {
            "label": "Bus factor",
            "score": MAX_BUS_FACTOR,
            "maxScore": MAX_BUS_FACTOR,
            "description": f"Bus factor {bus_factor}",
        }

    if bus_factor == 2:
        return {
            "label": "Bus factor",
            "score": 8,
            "maxScore": MAX_BUS_FACTOR,
            "description": "Bus factor 2",
        }

    share = top_contributor_share or 0
    login = top_contributor_login or "Top contributor"
    score = 0 if share >= 70 else 4

    return {
        "label": "Bus factor",
        "score": score,
        "maxScore": MAX_BUS_FACTOR,
        "description": f"Bus factor 1 ({login} {share}%)",
    }


def triage_metric(triage):
    if triage is None:
        return {
            "label": "Triage",
            "score": 7,
            "maxScore": MAX_TRIAGE,
            "description": "Triage data unavailable",
        }

    if triage["openItemCount"] == 0:
        return {
            "label": "Triage",
            "score": MAX_TRIAGE,
            "maxScore": MAX_TRIAGE,
            "description": "No open issues or pull requests",
        }

    median = triage["medianAgeDays"]

    if median <= 30:
        score = MAX_TRIAGE
    elif median <= 60:
        score = 10
    elif median <= 90:
        score = 5
    else:
        score = 0

    description = f"Median open item age: {median} days"

    if triage["stale30Percent"] > 0:
        description += (
            f" ({triage['stale30Percent']:.0f}% older than 30 days,"
            f" {triage['stale90Percent']:.0f}% older than 90 days)"
        )

    return {
        "label": "Triage",
        "score": score,
        "maxScore": MAX_TRIAGE,
        "description": description,
    }


def build_health_summary(
    latest_commit_date,
    open_issues,
    open_pull_requests,
    ci_status,
    latest_release,
    release_published_at,
    bus_factor=None,
    top_contributor_share=None,
    top_contributor_login=None,
    triage=None,
):
    metrics = [
        activity_metric(latest_commit_date),
        issues_metric(open_issues),
        pull_requests_metric(open_pull_requests),
        ci_metric(ci_status),
        release_metric(latest_release, release_published_at),
        bus_factor_metric(
            bus_factor,
            top_contributor_share,
            top_contributor_login,
        ),
        triage_metric(triage),
    ]

    health = sum(metric["score"] for metric in metrics)

    return health, metrics
