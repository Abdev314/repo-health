import argparse
import os
import requests
from datetime import datetime, timezone

GITHUB_API_URL = "https://api.github.com"


def validate_repository(repository):
    parts = repository.split("/")

    return (
        len(parts) == 2
        and bool(parts[0])
        and bool(parts[1])
    )


def load_repositories_from_file(filename):
    with open(filename, "r", encoding="utf-8") as file:
        repositories = []

        for line in file:
            repository = line.strip()

            if repository:
                repositories.append(repository)

    return repositories


def parse_arguments():
    parser = argparse.ArgumentParser(
        description="Check the health of GitHub repositories."
    )

    parser.add_argument(
        "repositories",
        nargs="*",
        help="GitHub repositories in owner/repo format",
    )

    parser.add_argument(
        "--file",
        help="Read repositories from a text file",
    )

    return parser.parse_args()


def github_request(endpoint):
    url = f"{GITHUB_API_URL}{endpoint}"

    headers = {
        "Accept": "application/vnd.github+json",
    }

    token = os.getenv("GITHUB_TOKEN")

    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as error:
        raise RuntimeError(f"GitHub API request failed: {error}") from error

    return response.json()


def get_repository_info(repository):
    data = github_request(f"/repos/{repository}")

    return {
        "name": data["full_name"],
        "stars": data["stargazers_count"],
        "forks": data["forks_count"],
        "open_issues": data["open_issues_count"],
        "default_branch": data["default_branch"],
    }


def get_latest_commit(repository):
    data = github_request(f"/repos/{repository}/commits")

    if not data:
        return None

    commit = data[0]["commit"]

    return {
        "date": commit["author"]["date"],
        "message": commit["message"],
    }


def get_activity_status(latest_commit):
    if not latest_commit:
        return "inactive"

    commit_date = datetime.fromisoformat(
        latest_commit["date"].replace("Z", "+00:00")
    )

    now = datetime.now(timezone.utc)
    days_since_commit = (now - commit_date).days

    return "active" if days_since_commit <= 90 else "inactive"



def get_latest_release(repository):
    try:
        data = github_request(f"/repos/{repository}/releases/latest")
    except RuntimeError as error:
        if "404" in str(error):
            return None
        raise

    return {
        "tag": data["tag_name"],
        "name": data["name"],
        "published_at": data["published_at"],
    }


def get_open_pull_requests(repository):
    data = github_request(f"/repos/{repository}/pulls?state=open")

    return len(data)


def get_ci_status(repository):
    data = github_request(
        f"/repos/{repository}/actions/runs?per_page=1"
    )

    runs = data.get("workflow_runs", [])

    if not runs:
        return None

    run = runs[0]

    return {
        "status": run["status"],
        "conclusion": run["conclusion"],
    }


def print_repository_report(
    info,
    latest_commit,
    latest_release,
    open_pull_requests,
    ci_status,
    activity_status,
):
    print()
    print("=" * 60)
    print(f"Repository: {info['name']}")
    print("=" * 60)
    print(f"Stars:              {info['stars']}")
    print(f"Forks:              {info['forks']}")
    print(f"Open issues:        {info['open_issues']}")
    print(f"Open pull requests: {open_pull_requests}")
    print(f"Activity:           {activity_status}")

    if latest_commit:
        print(f"Last commit:        {latest_commit['date']}")
        print(f"Commit message:     {latest_commit['message']}")
    else:
        print("Last commit:        None")

    if latest_release:
        print(
            f"Latest release:     "
            f"{latest_release['tag']} - {latest_release['name']}"
        )
        print(f"Released:           {latest_release['published_at']}")
    else:
        print("Latest release:     None")

    if ci_status:
        print(
            f"CI status:          "
            f"{ci_status['status']} ({ci_status['conclusion']})"
        )
    else:
        print("CI status:          None")


def main():
    args = parse_arguments()

    repositories = list(args.repositories)

    if args.file:
        try:
            repositories.extend(load_repositories_from_file(args.file))
        except OSError as error:
            print(f"Error reading file: {error}")
            return

    if not repositories:
        print("Error: no repositories provided")
        return

    valid_repositories = []

    for repository in repositories:
        if not validate_repository(repository):
            print(f"Invalid repository format: {repository}")
            continue

        valid_repositories.append(repository)

    if not valid_repositories:
        print("Error: no valid repositories provided")
        return

    for repository in valid_repositories:
        try:
            info = get_repository_info(repository)
            latest_commit = get_latest_commit(repository)
            latest_release = get_latest_release(repository)
            open_pull_requests = get_open_pull_requests(repository)
            ci_status = get_ci_status(repository)
            activity_status = get_activity_status(latest_commit)

            print_repository_report(
                info,
                latest_commit,
                latest_release,
                open_pull_requests,
                ci_status,
                activity_status,
            )
        except RuntimeError as error:
            print(f"Error: {error}")


if __name__ == "__main__":
    main()
