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
    token = os.getenv("GITHUB_API_URL")
    
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
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
    try: data= github_request(f"/repos/{repository}/releases/latest")
    except requests.HTTPError as error: 
        if error.response.status_code == 404:
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

def main():
    args = parse_arguments()

    for repository in args.repositories:
        if not validate_repository(repository):
            print(f"Invalid repository format: {repository}")
            return
        #data = github_request(f"/repos/{repository}")
        info = get_repository_info(repository)
        latest_commit = get_latest_commit(repository)
        latest_release = get_latest_release(repository)
        open_pull_requests = get_open_pull_requests(repository)
        ci_status = get_ci_status(repository)
        activity_status = get_activity_status(latest_commit)

        print(f"\nRepository: {info['name']}")
        print(f"Stars: {info['stars']}")
        print(f"Forks: {info['forks']}")
        print(f"Open issues: {info['open_issues']}")
        print(f"Default branch: {info['default_branch']}")

        if latest_commit:
            print(f"Last commit: {latest_commit['date']}")
            print(f"Message: {latest_commit['message']}")
        else:
            print("Last commit: None")
            
        print(f"Activity: {activity_status}")

        if latest_release:
            print(f"Latest release: {latest_release['tag']} - {latest_release['name']}")
            print(f"Released: {latest_release['published_at']}")
        else:
            print("Latest release: None")

        print(f"Open pull requests: {open_pull_requests}")

        if ci_status:
            print(
                f"CI status: {ci_status['status']} "
                f"({ci_status['conclusion']})"
            )
        else:
            print("CI status: None")

if __name__ == "__main__":
    main()
