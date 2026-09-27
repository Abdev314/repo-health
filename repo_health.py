import argparse
import os 
import requests

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


def main():
    args = parse_arguments()

    for repository in args.repositories:
        if not validate_repository(repository):
            print(f"Invalid repository format: {repository}")
            return
        #data = github_request(f"/repos/{repository}")
        info = get_repository_info(repository)
        latest_commit = get_latest_commit(repository)

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

if __name__ == "__main__":
    main()
