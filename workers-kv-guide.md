# Guide Cloudflare Workers + Workers KV

Le Worker fournit la couche API en production pour `index.html`, `bdd.html` et `admin.html`. Il réplique le comportement de `server.py` : validation des payloads, Turnstile, rate-limit et stockage persistant (Workers KV au lieu de SQLite/JSON).

## 1. Pré-requis
- Node.js ≥ 18 et `npm`
- CLI `wrangler` :
  ```bash
  npm install -g wrangler
  wrangler login
  ```
- Depuis `workers-argumentaires/`, installez les dépendances locales (`npm install`) afin de disposer de la version verrouillée de wrangler (`node_modules/.bin/wrangler`).

## 2. Espaces Workers KV
Créez deux namespaces (prod / préprod) et liez-les dans `wrangler.jsonc` :
```bash
wrangler kv namespace create "ARGUMENTAIRES"
wrangler kv namespace create "ARGUMENTAIRES_DEV"
```
Mettez à jour la configuration :
```jsonc
{
  "kv_namespaces": [
    { "binding": "KV_ARGUMENTAIRES", "id": "ID_PROD" }
  ],
  "env": {
    "dev": {
      "kv_namespaces": [
        { "binding": "KV_ARGUMENTAIRES", "id": "ID_DEV" }
      ]
    }
  }
}
```
`wrangler kv namespace list` permet de retrouver les IDs si besoin.

## 3. Secrets et script de déploiement
Secrets attendus :
| Nom | Rôle |
| --- | --- |
| `TURNSTILE_SECRET` | secret privé Turnstile (vérification côté Worker) |
| `API_SHARED_SECRET` | clé partagée optionnelle pour des appels backend → Worker (bypass Turnstile / rate-limit) |
| `ADMIN_PASSWORD_HASH` | **non utilisé** – le hash SHA-256 est codé en dur (`ADMIN_PASSWORD_HASH`) dans `server.py` et `src/index.ts` |

Utilisez `scripts/deploy.sh` pour piloter les secrets et lancer `wrangler deploy` :
```bash
TURNSTILE_SITE_KEY="pk_live_…" \
TURNSTILE_SECRET_VALUE="sk_live_…" \
API_SHARED_SECRET_VALUE="…" \
./scripts/deploy.sh dev|prod|both
```
Le script :
1. Injecte temporairement la site key dans `bdd.html`.
2. Pousse `TURNSTILE_SECRET` et `API_SHARED_SECRET` via `wrangler secret put` (prod + dev selon l’argument).
3. Déploie le Worker (prod et/ou dev).
4. Restaure `bdd.html` localement.

## 4. API exposée
### Endpoints publics
| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/argumentaires` | Retourne la liste ordonnée des argumentaires |
| `POST` | `/api/argumentaires` | Ajoute ou remplace un argumentaire. Valide la Turnstile token et applique le rate-limit |

### Endpoints admin (protégés)
| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Vérifie le mot de passe (`MotdePasse` par défaut) et renvoie un jeton (`x-admin-token`) |
| `GET` | `/api/admin/argumentaires` | Liste complète |
| `POST` | `/api/admin/argumentaires` | Ajout / mise à jour |
| `POST` | `/api/admin/argumentaires/delete` | Suppression par `name` |
| `GET` | `/api/admin/phenomenes` | Liste des phénomènes patriarcaux |
| `POST` | `/api/admin/phenomenes` | Ajout / mise à jour |
| `POST` | `/api/admin/phenomenes/delete` | Suppression par `name` |

Le jeton admin expire au bout d’une heure (`ADMIN_TOKEN_TTL_SECONDS`).

## 5. Sécurité : origines & rate-limit
- `STATIC_ALLOWED_ORIGINS` contient la liste blanche des origines autorisées (prod, préprod, environnements workers.dev, localhost). Ajoutez-y tout nouveau domaine et pensez à aligner `_headers` (`connect-src`).
- `FLEXIBLE_ALLOWED_SUFFIXES` autorise automatiquement certains suffixes (`.gitlab.io`, `.github.io`, `.workers.dev`).
- Le couple `RATE_LIMIT_MAX_REQUESTS = 10` / `RATE_LIMIT_BUCKET_SECONDS = 60` limite les envois anonymes à 10 requêtes par minute et par IP.

## 6. Déploiement manuel
```bash
cd workers-argumentaires
npm install          # première fois seulement
npm run build        # optionnel, TypeScript → JS (wrangler le fait automatiquement)
wrangler deploy      # production
wrangler deploy --env dev  # préproduction
```
Utilisez l’argument `--name` si vous déployez sur un compte différent. Pensez à tenir `wrangler.jsonc` et `package.json` synchronisés lorsque vous modifiez la compatibilité.

## 7. Données initiales
- `argumentaires.json` est chargée la première fois et stockée dans KV sous la clé `argumentaires.json`.
- `DEFAULT_PHENOMENES` (dans `src/index.ts`) alimente la clé `phenomenes.json` à l’initialisation.
- Les entrées incluent une estampille `updated_at` et un `ip_hash` si l’appel provient du POST public.

## 8. Développement local
1. Démarrez le serveur Python (`python3 server.py`) pour servir les pages et manipuler SQLite.
2. Dans un autre terminal :
   ```bash
   cd workers-argumentaires
   wrangler dev --env dev
   ```
3. Pour utiliser explicitement le Worker en local, définissez `ARGUMENTAIRES_API_URL` dans la console du navigateur ou ajoutez `data-api-base` sur `html`.
4. `ci_test_api.py` n’utilise que `server.py`. Pour tester le Worker manuellement, jouez un `curl` contre l’URL retournée par `wrangler dev`.

## 9. Maintenance
- Sur ajout d’un nouvel environnement :
  - Ajoutez l’origine dans `STATIC_ALLOWED_ORIGINS` et `_headers`.
  - Relancez `./scripts/deploy.sh both` pour pousser les secrets.
- Vérifiez régulièrement `wrangler tail` pour s’assurer que le rate-limit et Turnstile fonctionnent.
