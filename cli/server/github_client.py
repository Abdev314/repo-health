"""Communication with the GitHub REST API.

The token is only ever read here, server-side, and is never included
in responses or error messages. The token from the GITHUB_TOKEN
environment variable is preferred; if it is rejected by GitHub the
local cli/tk.txt file is used as a fallback.
"""

import os
from pathlib import Path

import requests

GITHUB_API_URL = "https://api.github.com"

_TOKEN_CACHE = None


class GitHubError(Exception):
    """An error talking to the GitHub API.

    Carries an HTTP status code that the Flask routes map onto their
    own response status.
    """

    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


class TokenNotConfiguredError(Exception):
    pass


def read_token_file():
    token_file = Path(__file__).resolve().parent.parent.parent / "cli" / "tk.txt"

    if not token_file.exists():
        return None

    return token_file.read_text().strip() or None


def token_is_valid(token):
    try:
        response = requests.get(
            f"{GITHUB_API_URL}/rate_limit",
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {token}",
            },
            timeout=10,
        )
    except requests.RequestException:
        return False

    return response.ok


def get_github_token():
    """Resolve a working token, preferring GITHUB_TOKEN over tk.txt."""

    global _TOKEN_CACHE

    if _TOKEN_CACHE:
        return _TOKEN_CACHE

    candidates = []

    environment_token = os.getenv("GITHUB_TOKEN")
    if environment_token:
        candidates.append(environment_token)

    file_token = read_token_file()
    if file_token and file_token not in candidates:
        candidates.append(file_token)

    if not candidates:
        raise TokenNotConfiguredError("GITHUB_TOKEN is not configured")

    for token in candidates:
        if token_is_valid(token):
            _TOKEN_CACHE = token
            return token

    raise GitHubError(
        "GitHub authentication failed. Check the token on the server.",
        status=502,
    )


def github_request(endpoint):
    try:
        token = get_github_token()
    except TokenNotConfiguredError as error:
        raise GitHubError(str(error), status=500) from error

    try:
        response = requests.get(
            f"{GITHUB_API_URL}{endpoint}",
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {token}",
            },
            timeout=10,
        )
    except requests.RequestException as error:
        raise GitHubError(
            "Could not reach GitHub. Please try again later.",
            status=503,
        ) from error

    if response.status_code == 404:
        raise GitHubError("Repository not found on GitHub.", status=404)

    if response.status_code == 429 or (
        response.status_code == 403
        and response.headers.get("x-ratelimit-remaining") == "0"
    ):
        raise GitHubError(
            "GitHub API rate limit reached. Please try again later.",
            status=429,
        )

    if response.status_code in {401, 403}:
        raise GitHubError(
            "GitHub authentication failed. Check the token on the server.",
            status=502,
        )

    if not response.ok:
        raise GitHubError(
            f"GitHub API request failed (status {response.status_code}).",
            status=502,
        )

    try:
        return response.json()
    except ValueError as error:
        raise GitHubError(
            "GitHub returned an unexpected response.", status=502
        ) from error


def github_request_optional(endpoint):
    """Request data where 404 simply means "no data".

    Used for endpoints such as the latest release or workflow runs,
    which legitimately return 404 when a repository has none.
    """

    try:
        return github_request(endpoint)
    except GitHubError as error:
        if error.status == 404:
            return None
        raise
