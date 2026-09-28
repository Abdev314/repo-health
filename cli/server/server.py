import os
from pathlib import Path

import requests
from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

GITHUB_API_URL = "https://api.github.com"


def get_github_token():
    token = os.getenv("GITHUB_TOKEN")

    if token:
        return token

    token_file = (
        Path(__file__).resolve().parent.parent
        / "cli"
        / "tk.txt"
    )

    if token_file.exists():
        token = token_file.read_text().strip()

    if not token:
        raise RuntimeError("GITHUB_TOKEN is not configured")

    return token


def github_request(endpoint):
    token = get_github_token()

    response = requests.get(
        f"{GITHUB_API_URL}{endpoint}",
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
        },
        timeout=10,
    )

    if not response.ok:
        raise RuntimeError(
            f"GitHub API request failed: {response.status_code}"
        )

    return response.json()


def get_activity(updated_at):
    from datetime import datetime, timezone

    updated = datetime.fromisoformat(
        updated_at.replace("Z", "+00:00")
    )

    days_since_update = (
        datetime.now(timezone.utc) - updated
    ).days

    return "active" if days_since_update <= 90 else "inactive"


def calculate_health(
    activity,
    issues,
    pull_requests,
    ci_status,
    latest_release,
):
    score = 0

    if activity == "active":
        score += 20

    if issues == 0:
        score += 20
    elif issues <= 5:
        score += 10

    if pull_requests == 0:
        score += 20
    elif pull_requests <= 3:
        score += 10

    if ci_status == "passing":
        score += 20

    if latest_release:
        score += 20

    return score


@app.get("/api/repositories/<owner>/<repository>")
def get_repository(owner, repository):
    try:
        data = github_request(
            f"/repos/{owner}/{repository}"
        )

        pulls = github_request(
            f"/repos/{owner}/{repository}/pulls"
            "?state=open&per_page=100"
        )

        try:
            release = github_request(
                f"/repos/{owner}/{repository}/releases/latest"
            )
            latest_release = release["tag_name"]
        except RuntimeError:
            latest_release = None

        try:
            workflows = github_request(
                f"/repos/{owner}/{repository}/actions/runs"
                "?per_page=1"
            )

            runs = workflows.get("workflow_runs", [])

            if not runs:
                ci_status = "unknown"
            elif runs[0]["conclusion"] == "success":
                ci_status = "passing"
            elif runs[0]["conclusion"] in {
                "failure",
                "cancelled",
            }:
                ci_status = "failing"
            else:
                ci_status = "unknown"

        except RuntimeError:
            ci_status = "unknown"

        activity = get_activity(data["updated_at"])

        pull_request_count = len(pulls)

        health = calculate_health(
            activity,
            data["open_issues_count"],
            pull_request_count,
            ci_status,
            latest_release,
        )

        return jsonify({
            "name": data["name"],
            "owner": data["owner"]["login"],
            "description": data["description"] or "",
            "language": data["language"] or "Unknown",
            "stars": data["stargazers_count"],
            "forks": data["forks_count"],
            "issues": data["open_issues_count"],
            "pullRequests": pull_request_count,
            "health": health,
            "activity": activity,
            "ciStatus": ci_status,
            "latestRelease": latest_release,
            "defaultBranch": data["default_branch"],
        })

    except RuntimeError as error:
        return jsonify({
            "error": str(error),
        }), 502


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
    )