"""Repo Health web API.

Run with:  python cli/server/server.py

Serves the normalized repository data consumed by the TypeScript
frontend. The GitHub token stays on the server and is never part of
any response.
"""

import re

from flask import Flask, jsonify
from flask_cors import CORS

from github_client import GitHubError
from repositories import build_repository_payload

app = Flask(__name__)
CORS(app)

OWNER_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9-]{0,38}$")
REPOSITORY_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{1,100}$")


def validate_repository_name(owner, repository):
    return bool(
        OWNER_PATTERN.match(owner) and REPOSITORY_PATTERN.match(repository)
    )


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"})


@app.get("/api/repositories/<owner>/<repository>")
def get_repository(owner, repository):
    if not validate_repository_name(owner, repository):
        return jsonify(
            {"error": "Invalid repository name. Use owner/repository."}
        ), 400

    try:
        payload = build_repository_payload(owner, repository)
    except GitHubError as error:
        return jsonify({"error": str(error)}), error.status

    return jsonify(payload)


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found."}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Unexpected server error."}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
