# Guide Cloudflare Workers + Workers KV

Ce dépôt fournit déjà un Worker prêt à l’emploi dans `workers-argumentaires/`. Il se charge :
- d’exposer l’API publique `/api/argumentaires` (GET/POST, Turnstile, rate-limit) ;
- de proposer des routes d’administration sécurisées (`/api/admin/*`) utilisées par `admin.html` ;
- de stocker argumentaires **et** phénomènes dans la même KV `KV_ARGUMENTAIRES`.

## 1. Pré-requis
- Node.js ≥ 18 et `npm`
- L’outil officiel `wrangler`
- Un compte Cloudflare avec accès aux Workers et à Workers KV

```bash
npm install -g wrangler
wrangler login
```

## 2. Espaces Workers KV
Crée deux namespaces (prod / preprod) et lie-les au Worker :

```bash
wrangler kv namespace create "ARGUMENTAIRES"
wrangler kv namespace create "ARGUMENTAIRES_DEV"
```

Dans `workers-argumentaires/wrangler.jsonc`, renseigne les IDs renvoyés par Cloudflare :

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

## 3. Secrets obligatoires
Le Worker lit trois secrets :

| Nom | Rôle |
| --- | --- |
| `TURNSTILE_SECRET` | Clé secrète pour vérifier Turnstile (optionnel en local) |
| `API_SHARED_SECRET` | Clé optionnelle pour les appels backend → Worker (bypass Turnstile/rate-limit) |
| `ADMIN_PASSWORD_HASH` | **Non utilisé** : le hash SHA‑256 est directement codé dans `src/index.ts`. Change-le en modifiant le fichier côté serveur et Worker. |

Pour la prod/dev :

```bash
wrangler secret put TURNSTILE_SECRET --env dev
wrangler secret put API_SHARED_SECRET --env dev
# répète la commande sans --env pour la prod
```

## 4. API exposée

### Endpoints publics
| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/argumentaires` | Retourne la liste ordonnée des argumentaires |
| `POST` | `/api/argumentaires` | Ajoute / remplace un argumentaire (Turnstile + rate limit par IP) |

### Endpoints admin (protégés)
| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Vérifie le mot de passe (`MotdePasse`) et renvoie un jeton temporaire |
| `GET` | `/api/admin/argumentaires` | Liste complète des argumentaires |
| `POST` | `/api/admin/argumentaires` | Ajoute ou remplace un argumentaire |
| `POST` | `/api/admin/argumentaires/delete` | Supprime un argumentaire par `name` |
| `GET` | `/api/admin/phenomenes` | Liste des phénomènes patriarcaux |
| `POST` | `/api/admin/phenomenes` | Ajoute / met à jour un phénomène |
| `POST` | `/api/admin/phenomenes/delete` | Supprime un phénomène par `name` |

Les requêtes admin doivent inclure l’en-tête `x-admin-token` avec le jeton fourni par `/api/admin/login`. Les jetons expirent au bout d’une heure.

## 5. Déploiement

```bash
cd workers-argumentaires
npm install        # une fois, si l’accès réseau est autorisé
wrangler deploy    # pour la prod
wrangler deploy --env dev  # pour la préprod
```

## 6. Données initiales
- Les argumentaires sont initialisés depuis `argumentaires.json` (chargé via GitLab/GitHub à la première mise en ligne).
- Les phénomènes patriarcaux sont initialisés dans le code (constante `DEFAULT_PHENOMENES`), puis stockés et modifiables via l’interface admin.

## 7. Développement local
1. Lance le serveur Python : `python3 server.py` (sert les fichiers statiques + API locale).
2. Démarre le Worker en mode dev :
   ```bash
   cd workers-argumentaires
   wrangler dev --env dev
   ```
3. Utilise `http://localhost:8000/admin.html` pour tester l’administration.

Pense à relancer `wrangler deploy` après chaque modification du Worker pour synchroniser la logique (public + admin) côté Cloudflare.
