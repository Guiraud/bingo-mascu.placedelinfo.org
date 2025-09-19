interface Env {
  KV_ARGUMENTAIRES: KVNamespace;
}

const ARGUMENTAIRES_KEY = "argumentaires.json";
const STATIC_ALLOWED_ORIGINS = new Set(
  [
    'https://bingo-mascu.mehdiguiraud.net',
    'https://guiraud.github.io',
    'https://guiraud.gitlab.io',
    'https://workers-argumentaires.guiraud.workers.dev',
    'https://dev.workers-argumentaires.guiraud.workers.dev',
    'http://localhost:8000',
    'http://127.0.0.1:8787'
  ].map(origin => origin.toLowerCase())
);

const FLEXIBLE_ALLOWED_SUFFIXES = ['.gitlab.io', '.github.io', '.workers.dev'];

interface ArgumentaireItem {
  phrase: string;
  argumentaire: string;
  sources?: Array<Record<string, string>>;
}

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
        const payload = (await request.json()) as Record<string, unknown>;
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
      } catch (error) {
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
  const sourcesInput = Array.isArray(value["sources"]) ? value["sources"] : [];
  const sources = sourcesInput
    .filter(item => item && typeof item === "object")
    .map(item => {
      const obj = item as Record<string, unknown>;
      const source: Record<string, string> = {};
      if (typeof obj.titre === "string" && obj.titre.trim()) {
        source.titre = obj.titre.trim();
      }
      if (typeof obj.auteur === "string" && obj.auteur.trim()) {
        source.auteur = obj.auteur.trim();
      }
      if (typeof obj.url === "string" && obj.url.trim()) {
        source.url = obj.url.trim();
      }
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
    'access-control-allow-origin': allowOrigin(origin),
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'Origin'
  };

  if (isPreflight) {
    headers['access-control-max-age'] = '86400';
  }

  return headers;
}

function allowOrigin(origin: string): string {
  if (!origin) {
    return '*';
  }
  const normalized = origin.toLowerCase();
  if (STATIC_ALLOWED_ORIGINS.has(normalized)) {
    return origin;
  }

  try {
    const url = new URL(origin);
    if (FLEXIBLE_ALLOWED_SUFFIXES.some(suffix => url.hostname.endsWith(suffix))) {
      return origin;
    }
  } catch {
    // ignore invalid origin and fall back to wildcard
  }

  return '*';
}
