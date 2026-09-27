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


def main():
    args = parse_arguments()

    for repository in args.repositories:
        if not validate_repository(repository):
            print(f"Invalid repository format: {repository}")
            return
        data = github_request(f"/repos/{repository}")

    print("Repositories:", args.repositories)
    print("File:", args.file)
    print(f"Stars: {data['stargazers_count']}")
    print(f"Forks: {data['forks_count']}")

if __name__ == "__main__":
    main()
