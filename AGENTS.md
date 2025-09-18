# Repository Guidelines

## Project Structure & Module Organization
- Static pages (`index.html`, `profil.html`, `mentions-legales.html`, etc.) live at the repo root and are shipped as-is to both GitLab and GitHub Pages.
- `server.py` exposes the bingo API and serves the static front-end; it seeds and persists data in `argumentaires.db` (created on first run).
- Keep new shared assets alongside the page that consumes them; if you introduce bundles, group them in a top-level `assets/` directory and reference relative paths only.
- Respect the Git remotes described in `README.md`: develop on `dev`, mirror to GitLab for staging, then fast-forward `main`/`gh-pages` for production.

## Build, Test, and Development Commands
- `python3 -m venv .venv && source .venv/bin/activate` (optional) to isolate dependencies before running the server.
- `python3 server.py` launches the threaded dev server on http://localhost:8000, initializes the SQLite database, and serves the static files.
- `python3 -m py_compile server.py` mirrors the GitLab CI syntax check; run after Python edits.
- `curl http://localhost:8000/api/argumentaires` verifies the API JSON payload after data changes.

## Coding Style & Naming Conventions
- Python: follow PEP 8, 4-space indentation, type hints, `snake_case` names, and keep JSON serialization with `ensure_ascii=False` for French content.
- HTML/CSS: two-space indentation, lowercase tags/attributes, and prefer CSS custom properties (see `index.html`) over magic values.
- Branch names should be descriptive kebab-case (`feature/refine-bingo-grid`, `fix/api-status-code`).

## Testing Guidelines
- There is no automated test suite yet; rely on `py_compile` plus functional smoke tests against the running server.
- Before opening a merge request, exercise the main pages in a browser and hit the API endpoints with `curl` or your client to confirm new records persist in `argumentaires.db`.

## Commit & Pull Request Guidelines
- Use imperative Conventional Commits (`feat: ajoute un filtre API`, `fix: corrige la nav mobile`) to simplify changelog generation.
- Limit the subject to 72 characters, add concise body context when needed, and mention the commands you ran under a `Tests:` line.
- Merge requests / pull requests should include a short summary, linked issue (if any), deployment impact, and screenshots or terminal output when UI or API responses change.

## Security & Configuration Tips
- Never commit secrets or local SQLite dumps beyond `argumentaires.db` seeds; purge personal data before pushing.
- Keep Git remotes authenticated via SSH and update Cloudflare/GitHub DNS settings only through the documented process in `README.md`.
