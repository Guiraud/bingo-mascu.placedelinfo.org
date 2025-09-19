# Guide simple: Cloudflare Workers + Workers KV

Ce document explique comment stocker les argumentaires dans Cloudflare Workers KV et les récupérer depuis ta page GitHub Pages. Toutes les étapes sont décrites avec des mots simples.

## 1. Comprendre l'objectif
- **Workers**: petit script JavaScript qui répond aux requêtes HTTP.
- **Workers KV**: base clé/valeur pour sauvegarder des données simples (ici ton `argumentaires.json`).
- But: ta page GitHub Pages envoie un `POST` vers le Worker pour enregistrer l'argumentaire, et un `GET` pour lire le JSON.

## 2. Préparer ton environnement
1. Crée un compte sur <https://dash.cloudflare.com/> si tu n'en as pas.
2. Installe Node.js (>= 18) pour utiliser l'outil `wrangler`.
3. Installe `wrangler` en global:
   ```bash
   npm install -g wrangler
   ```
4. Connecte `wrangler` à ton compte:
   ```bash
   wrangler login
   ```
   Une page web s'ouvre et tu autorises l'accès.

## 3. Créer le projet Worker
1. Dans ton dossier de projet, lance:
   ```bash
   wrangler init workers-argumentaires
   ```
2. Quand l'assistant interactif apparaît, choisis successivement : **Hello World example**, **Worker only**, puis **TypeScript** (ou **JavaScript** si tu préfères sans types).
3. Va dans le dossier généré:
   ```bash
   cd workers-argumentaires
   ```
4. Le fichier `src/index.ts` (ou `index.js`) contient ton code Worker. Nous allons le modifier plus tard.

## 4. Créer les namespaces Workers KV
Nous allons utiliser deux namespaces: un pour la prod (`ARGUMENTAIRES`) et un pour la préprod (`ARGUMENTAIRES_DEV`). Tu peux les créer en ligne de commande ou via le dashboard.

### Option ligne de commande
```bash
wrangler kv namespace create "ARGUMENTAIRES"
wrangler kv namespace create "ARGUMENTAIRES_DEV"
```
- Chaque commande affiche un `id` (longue chaîne hexadécimale). Note bien les deux valeurs.
- Wrangler propose d'ajouter automatiquement le binding dans `wrangler.jsonc`; accepte et renomme le binding si besoin.

### Option dashboard (si tu préfères)
1. Dans le dashboard Cloudflare, ouvre **Workers & Pages > KV**.
2. Clique sur **Create a namespace** pour créer `ARGUMENTAIRES`, puis recommence pour `ARGUMENTAIRES_DEV`.
3. Copie les `ID` des deux namespaces (prod & dev).

## 5. Configurer `wrangler.jsonc`
`wrangler init` crée un fichier `wrangler.jsonc`. Ouvre-le et vérifie qu'il ressemble à ceci (remplace les IDs par ceux obtenus à l'étape précédente):
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "workers-argumentaires",
  "main": "src/index.ts",
  "compatibility_date": "2025-09-19",
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
- `ID_PROD` = namespace `ARGUMENTAIRES`, `ID_DEV` = namespace `ARGUMENTAIRES_DEV`.
- On réutilise le même binding (`KV_ARGUMENTAIRES`) mais l'ID change selon l'environnement.
- Si Wrangler a déjà inséré un binding automatique, ajuste simplement l'ID et ajoute la section `env` manuellement.

## 6. Écrire le code Worker
Ouvre `src/index.ts` (ou `.js`) et remplace par ce code minimal:
```ts
interface Env {
  KV_ARGUMENTAIRES: KVNamespace;
}

interface ArgumentaireItem {
  phrase: string;
  argumentaire: string;
  sources?: Array<Record<string, string>>;
}

const ARGUMENTAIRES_KEY = "argumentaires.json";
const ALLOWED_ORIGINS = new Set([
  "https://ton-site-dev.gitlab.io",
  "https://ton-site.github.io",
  "https://ton-worker.workers.dev",
  "https://dev.ton-worker.workers.dev",
  "http://localhost:8000",
  "http://127.0.0.1:8787"
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") ?? "";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, true)
      });
    }

    if (request.method === "POST" && url.pathname === "/api/argumentaires") {
      try {
        const payload = await request.json() as Record<string, unknown>;
        const entry = normalizeEntry(payload);
        if (!entry) {
          return jsonResponse({ error: "invalid-payload" }, 400, origin);
        }

        const list = await readArgumentaires(env);
        const filtered = list.filter(item => item.phrase !== entry.phrase);
        filtered.push(entry);
        filtered.sort((a, b) => a.phrase.localeCompare(b.phrase, 'fr', { sensitivity: 'base' }));
        await env.KV_ARGUMENTAIRES.put(ARGUMENTAIRES_KEY, JSON.stringify(filtered));

        return jsonResponse({ status: "ok" }, 201, origin);
      } catch {
        return jsonResponse({ error: "invalid-json" }, 400, origin);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/argumentaires") {
      const list = await readArgumentaires(env);
      return new Response(JSON.stringify(list), {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          "content-type": "application/json; charset=utf-8"
        }
      });
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders(origin)
    });
  }
};

async function readArgumentaires(env: Env): Promise<ArgumentaireItem[]> {
  const raw = await env.KV_ARGUMENTAIRES.get(ARGUMENTAIRES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => normalizeEntry(item as Record<string, unknown>))
        .filter((item): item is ArgumentaireItem => Boolean(item));
    }
  } catch (error) {
    console.warn("Invalid JSON stored in KV", error);
  }
  return [];
}

function normalizeEntry(value: Record<string, unknown> | null | undefined): ArgumentaireItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const phrase = typeof value["phrase"] === "string" ? value["phrase"].trim() : "";
  const argumentaire = typeof value["argumentaire"] === "string" ? value["argumentaire"].trim() : "";
  if (!phrase || !argumentaire) {
    return null;
  }
  const sourcesArray = Array.isArray(value["sources"]) ? value["sources"] : [];
  const sources = sourcesArray
    .filter(item => item && typeof item === "object")
    .map(item => {
      const obj = item as Record<string, unknown>;
      const source: Record<string, string> = {};
      if (typeof obj.titre === "string" && obj.titre.trim()) source.titre = obj.titre.trim();
      if (typeof obj.auteur === "string" && obj.auteur.trim()) source.auteur = obj.auteur.trim();
      if (typeof obj.url === "string" && obj.url.trim()) source.url = obj.url.trim();
      return source;
    })
    .filter(source => Object.keys(source).length > 0);

  return sources.length ? { phrase, argumentaire, sources } : { phrase, argumentaire };
}

function jsonResponse(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function corsHeaders(origin: string, isPreflight = false): Record<string, string> {
  const headers: Record<string, string> = {
    "access-control-allow-origin": allowOrigin(origin),
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type"
  };

  if (isPreflight) {
    headers["access-control-max-age"] = "86400";
  }

  return headers;
}

function allowOrigin(origin: string): string {
  if (ALLOWED_ORIGINS.has(origin) || origin === "") {
    return origin || "*";
  }
  return "*";
}
```
- Mets à jour `ALLOWED_ORIGINS` avec les URL autorisées (ex: GitHub Pages, GitLab Pages, localhost, domaine Workers).
- Mets aussi à jour les valeurs de secours dans `resolveApiBase` (`bdd.html`, `index.html`) pour pointer vers ton domaine Workers (prod et dev).
- Si tu utilises JavaScript, supprime la déclaration `interface Env` et les types.
- Le Worker conserve la liste complète d'argumentaires (le POST remplace ou ajoute l'entrée correspondant à la phrase) avant de la renvoyer.

## 7. Tester en local
1. Lancer le Worker localement (namespace préprod) :
   ```bash
   wrangler dev --env dev
   ```
2. Dans un autre terminal, teste l'écriture:
   ```bash
   curl -X POST "http://127.0.0.1:8787/api/argumentaires" \
     -H "content-type: application/json" \
     -d '{"items": ["argument 1", "argument 2"]}'
   ```
3. Vérifie la lecture:
   ```bash
   curl "http://127.0.0.1:8787/api/argumentaires"
   ```
4. Si tout va bien, `wrangler dev` affiche aussi les logs.

## 8. Déployer sur Cloudflare
1. Déploie la version préprod si besoin:
   ```bash
   wrangler deploy --env dev
   ```
   (facultatif si tu utilises uniquement `wrangler dev` pour les tests).
2. Déploie la prod:
   ```bash
   wrangler deploy
   ```
3. `wrangler` affiche une URL publique du type `https://workers-argumentaires.ton-sous-domaine.workers.dev`.
4. Note cette URL: ta page GitHub Pages l'utilisera pour les requêtes `fetch`.

## 9. Mettre à jour ta page GitHub Pages
1. Dans ton JavaScript front, envoie un `POST` pour enregistrer:
   ```js
   fetch("https://workers-argumentaires.tu-compte.workers.dev/api/argumentaires", {
     method: "POST",
     headers: { "content-type": "application/json" },
     body: JSON.stringify(argumentaires)
   });
   ```
2. Pour lire:
   ```js
   const response = await fetch("https://workers-argumentaires.tu-compte.workers.dev/api/argumentaires");
   const data = await response.json();
   ```
3. Ajoute une petite interface pour confirmer la sauvegarde (toast, message, etc.).

## 10. Conseils de sécurité
- Vérifie qui peut écrire: ajoute une clé secrète (`Authorization`) et contrôle-la dans le Worker.
- Ajoute de la validation: vérifie que les champs attendus sont présents avant de stocker.
- Si tu veux modérer, ajoute un champ `pending` et un autre script pour republier après validation.

## 11. Sauvegarde vers GitHub (optionnelle)
- Tu peux stocker un `GITHUB_TOKEN` comme secret Worker:
  ```bash
  wrangler secret put GITHUB_TOKEN
  ```
- Dans le Worker, fais un `fetch` vers l'API GitHub pour mettre à jour `argumentaires.json` après chaque écriture.
- Gère les conflits (`sha`) en lisant d'abord le fichier actuel via l'API GitHub.

## 12. Nettoyage et limites
- KV propage les écritures en quelques secondes, pas instantanément. Informe l'utilisateur.
- Taille max d'une valeur KV: 25 Mo (largement suffisant pour ton JSON).
- Purge: `wrangler kv:key list` et `wrangler kv:delete` si besoin.
- Surveille ton quota gratuit: 100 000 lectures et 1 000 écritures/jour.

Tu as maintenant un Worker opérationnel avec Workers KV pour gérer tes argumentaires sans backend dédié.
