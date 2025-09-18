"""CI smoke test ensuring the argumentaires API can persist entries."""

from __future__ import annotations

import json
import sqlite3
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen


BASE_URL = "http://127.0.0.1:8000"
PAYLOAD = {
    "phrase": "CI phrase test",
    "argumentaire": "Validation GitLab CI des sauvegardes d'argumentaires.",
    "sources": [
        {"titre": "GitLab CI"},
    ],
}


def wait_for_server(process: subprocess.Popen, timeout: float = 15.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urlopen(f"{BASE_URL}/"):  # noqa: S310 - localhost call
                return
        except URLError:
            if process.poll() is not None:
                stdout, _ = process.communicate()
                details = stdout or ""
                if details:
                    details = f"\nSortie serveur:\n{details.strip()}"
                raise RuntimeError(
                    "Le serveur s'est arrêté avant d'être prêt" + details
                )
            time.sleep(0.5)
    raise RuntimeError("Le serveur n'a pas démarré dans les temps")


def post_argumentaire(payload: dict[str, Any]) -> dict[str, Any]:
    request = Request(
        f"{BASE_URL}/api/argumentaires",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request) as response:  # noqa: S310 - localhost call
        if response.status != 200:
            raise RuntimeError(f"Statut inattendu {response.status}")
        return json.loads(response.read().decode("utf-8"))


def fetch_argumentaires() -> list[dict[str, Any]]:
    with urlopen(f"{BASE_URL}/api/argumentaires") as response:  # noqa: S310
        if response.status != 200:
            raise RuntimeError(f"Statut inattendu {response.status}")
        return json.loads(response.read().decode("utf-8"))


def cleanup_db(phrase: str) -> None:
    db_path = Path("argumentaires.db")
    if not db_path.exists():
        return
    conn = sqlite3.connect(db_path)
    try:
        conn.execute("DELETE FROM argumentaires WHERE phrase = ?", (phrase,))
        conn.commit()
    finally:
        conn.close()


def main() -> None:
    server = subprocess.Popen(
        [sys.executable, "server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    try:
        wait_for_server(server)
        posted = post_argumentaire(PAYLOAD)
        if posted.get("phrase") != PAYLOAD["phrase"]:
            raise RuntimeError("Réponse JSON inattendue côté POST")

        data = fetch_argumentaires()
        phrases = {item.get("phrase") for item in data}
        if PAYLOAD["phrase"] not in phrases:
            raise RuntimeError("L'argumentaire inséré est introuvable via GET")
    finally:
        if server.poll() is None:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
        cleanup_db(PAYLOAD["phrase"])


if __name__ == "__main__":
    main()
