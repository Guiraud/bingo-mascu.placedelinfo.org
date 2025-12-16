# Bingo féministe

## Aperçu
- Application statique permettant de générer des grilles de bingo autour des masculinités toxiques et de documenter chaque case avec des sources sourcées.
- `index.html` propose une grille interactive, un suivi des statistiques, un mode compact automatique et un export PDF via `assets/jspdf.umd.min.js`.
- `bdd.html` expose la base de connaissances complète et permet de proposer de nouveaux argumentaires grâce à un formulaire protégé par Turnstile.
- `admin.html` fournit une interface sécurisée pour gérer argumentaires et phénomènes patriarcaux directement depuis l’API.

## Architecture
### Front-end
- Pages statiques servies depuis la racine : `index.html`, `bdd.html`, `admin.html`, `profil.html` ainsi que les pages légales (`mentions-legales.html`, `politique-confidentialite.html`, `conditions-utilisation.html`).
- `index.js` construit la grille, applique les phénomènes (`phenomenes.json`), calcule les bingos et orchestre l’export du rapport PDF.
- `bdd.js` charge l’API `/api/argumentaires`, fusionne les données distantes avec un jeu de secours et bloque l’envoi si Turnstile n’est pas configuré.
- `admin.js` réalise l’authentification, manipule les entrées via les routes `/api/admin/*` et stocke le jeton d’administration en `sessionStorage`.

### Backend local
- `python3 server.py` lance un serveur HTTP multi-threads sur `http://localhost:8000`.
- À la première exécution, `argumentaires.db` (SQLite) et `phenomenes.json` sont initialisés à partir des constantes `INITIAL_ARGUMENTAIRES` et `DEFAULT_PHENOMENES`.
- Les routes `/api/argumentaires` et `/api/admin/*` manipulent la base SQLite et le fichier JSON en appliquant une validation stricte.
- `ci_test_api.py` est utilisé à la fois en local et dans la CI pour vérifier qu’un argumentaire peut être posté puis relu.

### Cloudflare Worker
- `workers-argumentaires/src/index.ts` réplique l’API en production : routes publiques, administration, Turnstile, rate-limit (10 requêtes/minute par IP) et stockage dans Workers KV.
- Une liste d’origines autorisées est codée en dur (`STATIC_ALLOWED_ORIGINS`) et doit être ajustée dès qu’un nouvel environnement est mis en ligne (penser aussi à `_headers`).
- Configuration centralisée dans `wrangler.toml` (racine du dépôt) avec `observability.enabled = true`, `compatibility_date` et les IDs de namespaces (`KV_ARGUMENTAIRES`). Exécutez toujours les commandes `wrangler` depuis la racine ou en passant `--config wrangler.toml` (les scripts fournis l’ajoutent automatiquement).

### Données métiers
- `argumentaires.json` : graine des argumentaires utilisée par le Worker et par la première exécution du serveur Python.
- `argumentaires.db` : base SQLite générée par `server.py`, synchronisée par `ci_test_api.py` et persistante en local.
- `phenomenes.json` : liste des phénomènes patriarcaux affichés dans les cases spéciales de la grille.
- `assets/jspdf.umd.min.js` : dépendance front empaquetée localement, éviter tout chargement CDN pour respecter le CSP.

## Dépôts et environnements
- **Préproduction** : `gitlab.com/Guiraud/bingo-mascu.placedelinfo.org`, branche `dev`, publiée sur `https://guiraud.gitlab.io/bingo-mascu.placedelinfo.org/`.
- **Production** : `github.com/Guiraud/bingo-mascu.placedelinfo.org`, branches `main` / `gh-pages`, servies derrière Cloudflare sur `https://bingo-mascu.mehdiguiraud.net`.
- Remotes recommandés :
  ```bash
  git remote add dev git@gitlab.com:Guiraud/bingo-mascu-placedelinfo-org.git
  git remote add origin git@github.com:Guiraud/bingo-mascu.placedelinfo.org.git
  ```
- Travaillez sur `dev`, poussez sur GitLab pour prévisualiser, puis fast-forward `main` + `gh-pages` sur GitHub.

## Développement local
1. (Optionnel) Créez un environnement virtuel :
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Installez les dépendances Node si vous modifiez le Worker :
   ```bash
   cd workers-argumentaires
   npm install
   ```
3. Lancez le serveur Python :
   ```bash
   python3 server.py
   ```
   L’API est disponible sur `http://localhost:8000`. Les pages statiques et l’administration fonctionnent immédiatement avec les données locales.
4. (Facultatif) Ouvrez un Worker de développement :
   ```bash
   cd workers-argumentaires
   npm run dev        # alias pour `wrangler dev --config ../wrangler.toml --env dev`
   ```
   Puis définissez `ARGUMENTAIRES_API_URL` dans votre navigateur si vous voulez cibler explicitement le Worker.

## Tests et intégration continue
- Vérification Python : `python3 -m py_compile server.py`.
- Test end-to-end minimal : `python3 ci_test_api.py` (démarre le serveur, poste un argumentaire et valide la lecture).
- Contrôle manuel : `curl http://localhost:8000/api/argumentaires`.

`.gitlab-ci.yml` exécute ces contrôles sur la branche `dev` :
```yaml
image: python:3.11

stages:
  - test
  - deploy

variables:
  PYTHONPYCACHEPREFIX: .cache

test:python:
  stage: test
  script:
    - python3 -m py_compile server.py
    - python3 ci_test_api.py
  only:
    - dev

pages:
  stage: deploy
  script:
    - rm -rf public
    - mkdir -p public
    - find . -maxdepth 1 ! -name '.' ! -name 'public' ! -name '.git' ! -name '.gitlab-ci.yml' -exec cp -r {} public/ \;
  artifacts:
    paths:
      - public
  only:
    - dev
```

## Déploiement
1. **Pousser la préproduction**
   ```bash
   git checkout dev
   git pull --ff-only dev dev
   python3 -m py_compile server.py
   python3 ci_test_api.py
   git push dev dev
   ```
2. **Vérifier** `https://guiraud.gitlab.io/bingo-mascu.placedelinfo.org/` et l’API `https://workers-argumentaires-dev.mehdi-guiraud.workers.dev` (ou le Worker de préprod actif).
3. **Fast-forward production côté GitLab**
   ```bash
   git checkout main
   git fetch dev main
   git merge --ff-only dev/main
   git push dev main
   ```
4. **Publier sur GitHub / Cloudflare Pages**
   ```bash
   git push origin main
   git push origin main:gh-pages
   ```
5. **Déployer / mettre à jour le Worker**
   - Utilisez `scripts/deploy.sh` pour gérer les secrets Turnstile et l’éventuel `API_SHARED_SECRET` :
     ```bash
     TURNSTILE_SITE_KEY="pk_live_…" \
     TURNSTILE_SECRET_VALUE="sk_live_…" \
     API_SHARED_SECRET_VALUE="…" \
     ./scripts/deploy.sh both
     ```
   - Le script remplace temporairement la clé dans `bdd.html`, pousse les secrets via `wrangler secret put` puis lance `wrangler deploy` (prod et/ou dev) avant de restaurer le fichier local.

## Cloudflare
Le build Cloudflare Pages est configuré sur `npm run deploy` ; ce script ne fait qu’afficher un rappel, le Worker étant déployé via `scripts/deploy.sh` ou manuellement avec `wrangler deploy --config wrangler.toml`.

### DNS & Pages
- **Sous-domaine recommandé** : créez un enregistrement `CNAME` (`www` → `votre-utilisateur.github.io`) et activez le proxy (nuage orange).
- **Apex** : utilisez le flattening Cloudflare (`CNAME @ → votre-utilisateur.github.io`) puis, si besoin, une règle 301 vers `www`.

### Déclarer le domaine dans GitHub Pages
1. `Settings > Pages` → renseignez `bingo-mascu.mehdiguiraud.net` (ou votre domaine).
2. Contrôlez la création du fichier `CNAME`.

### SSL/TLS
1. Mode `Full` ou `Full (strict)` selon vos certificats.
2. Activez `Always Use HTTPS` et `Automatic HTTPS Rewrites`.
3. Vérifiez que le certificat est `Active`.

### Optimisations
- Activez `Brotli`, `Early Hints` et ajustez la `Browser Cache TTL`.
- Évitez `Cache Everything` tant que l’API reste dynamique.
- Ajoutez des règles de firewall si nécessaire.

## Turnstile (anti-robot)
1. Créez un widget Turnstile « Managed challenge » pour `bingo-mascu.mehdiguiraud.net` et récupérez site key + secret.
2. Déployez les secrets via `scripts/deploy.sh` (voir ci-dessus). Le script gère également `API_SHARED_SECRET` et restaure `bdd.html`.
3. Vérifiez `https://bingo-mascu.mehdiguiraud.net/bdd.html` : le widget doit apparaître, les soumissions doivent renvoyer `201` et la console ne doit pas contenir `turnstile-verification-failed`.
4. À chaque nouvel environnement, ajoutez le domaine dans `connect-src` (`_headers`) et dans `STATIC_ALLOWED_ORIGINS` (`workers-argumentaires/src/index.ts`).

## Administration éditoriale
- Authentifiez-vous sur `admin.html` avec le mot de passe dont le SHA-256 correspond à `ADMIN_PASSWORD_HASH` (`MotdePasse` par défaut, à synchroniser entre Worker et serveur).
- L’API renvoie `token` via `/api/admin/login`; il est valables 1 heure et est stocké côté Worker dans Workers KV (`TOKEN_PREFIX`).
- Routes disponibles :
  - `GET /api/admin/argumentaires`, `POST /api/admin/argumentaires`, `POST /api/admin/argumentaires/delete`
  - `GET /api/admin/phenomenes`, `POST /api/admin/phenomenes`, `POST /api/admin/phenomenes/delete`
- Les requêtes doivent inclure `X-Admin-Token`. Les sources attendent une liste JSON validée côté serveur et Worker.

## Dépannage
- **Propagation DNS** : jusqu’à 24 h. Utilisez `dig` / `nslookup`.
- **Boucles HTTPS** : si Cloudflare et GitHub imposent HTTPS simultanément, désactivez l’option côté GitHub.
- **Erreurs 525/526** : repassez en `Full`, vérifiez que GitHub répond en HTTPS.
- **Contenu obsolète** : purgez le cache (`Caching > Configuration > Purge Cache`) après une mise en production.

## Aller plus loin
- Utilisez Workers/Pages Rules pour des redirections avancées.
- Branchez Cloudflare Analytics pour suivre le trafic sans scripts externes.
- Ajoutez une action GitHub pour purger automatiquement le cache Cloudflare après chaque déploiement.
