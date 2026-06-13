
interface Env {
  KV_ARGUMENTAIRES: KVNamespace;
  TURNSTILE_SECRET?: string;
  API_SHARED_SECRET?: string;
}

const ARGUMENTAIRES_KEY = "argumentaires.json";
const STATIC_ALLOWED_ORIGINS = new Set(
  [
    'https://bingo-mascu.mehdiguiraud.net',
    'https://guiraud.github.io',
    'https://guiraud.gitlab.io',
    'https://workers-argumentaires.guiraud.workers.dev',
    'https://workers-argumentaires.mehdi-guiraud.workers.dev',
    'https://workers-argumentaires-dev.mehdi-guiraud.workers.dev',
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

interface ArgumentaireItem {
  phrase: string;
  argumentaire: string;
  sources?: Array<Record<string, string>>;
  updated_at: string;
  ip_hash?: string;
}

interface NormalizedEntry {
  item: ArgumentaireItem;
  phraseKey: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('origin') ?? '';
    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';

    if (!isOriginAllowed(origin) && origin !== '') {
      return jsonResponse({ error: 'origin-not-allowed' }, 403, origin);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, true) });
    }

    const url = new URL(request.url);

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

      if (env.API_SHARED_SECRET) {
        const suppliedSecret = request.headers.get('x-api-key');
        if (suppliedSecret !== env.API_SHARED_SECRET) {
          return jsonResponse({ error: 'unauthorized' }, 401, origin);
        }
      }

      let payload: Record<string, unknown>;
      try {
        payload = await request.json() as Record<string, unknown>;
      } catch {
        return jsonResponse({ error: 'invalid-json' }, 400, origin);
      }

      if (env.TURNSTILE_SECRET) {
        const token = typeof payload.turnstile_token === 'string' ? payload.turnstile_token : '';
        const turnstileOk = await verifyTurnstile(env.TURNSTILE_SECRET, token, ip);
        if (!turnstileOk) {
          return jsonResponse({ error: 'turnstile-verification-failed' }, 403, origin);
        }
      }

      const normalized = normalizeEntry(payload, ip);
      if (!normalized) {
        return jsonResponse({ error: 'invalid-payload' }, 422, origin);
      }

      const items = await readArgumentaires(env);
      const filtered = items.filter(item => item.phrase.toLowerCase() !== normalized.phraseKey);
      filtered.push(normalized.item);
      filtered.sort((a, b) => a.phrase.localeCompare(b.phrase, 'fr', { sensitivity: 'base' }));
      await env.KV_ARGUMENTAIRES.put(ARGUMENTAIRES_KEY, JSON.stringify(filtered));

      return jsonResponse({ status: 'ok' }, 201, origin);
    }

    if (request.method === "GET" && url.pathname === "/api/argumentaires") {
      const list = await readArgumentaires(env);
      return new Response(JSON.stringify(list), {
        status: 200,
        headers: {
          ...corsHeaders(origin, false),
          'content-type': 'application/json; charset=utf-8'
        }
      });
    }

    return jsonResponse({ error: 'not-found' }, 404, origin);
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

  const phrase = escapeHtml(phraseRaw);
  const argumentaire = escapeHtml(argumentaireRaw);
  const phraseKey = phrase.toLowerCase();

  const sources: Array<Record<string, string>> = [];
  for (const source of sourcesRaw.slice(0, MAX_SOURCES)) {
    if (!source || typeof source !== 'object') continue;
    const titreRaw = typeof (source as Record<string, unknown>).titre === 'string' ? (source as Record<string, unknown>).titre.trim() : '';
    const auteurRaw = typeof (source as Record<string, unknown>).auteur === 'string' ? (source as Record<string, unknown>).auteur.trim() : '';
    const urlRaw = typeof (source as Record<string, unknown>).url === 'string' ? (source as Record<string, unknown>).url.trim() : '';

    if (!titreRaw && !urlRaw) continue;
    if (urlRaw && !isSafeUrl(urlRaw)) continue;

    const clean: Record<string, string> = {};
    if (titreRaw) clean.titre = escapeHtml(titreRaw);
    if (auteurRaw) clean.auteur = escapeHtml(auteurRaw);
    if (urlRaw) clean.url = urlRaw;
    sources.push(clean);
  }

  return {
    phraseKey,
    item: {
      phrase,
      argumentaire,
      sources: sources.length ? sources : undefined,
      updated_at: new Date().toISOString(),
      ip_hash: hashIp(ip)
    }
  };
}

function normalizeStoredItem(value: Record<string, unknown>): ArgumentaireItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const phrase = typeof value.phrase === 'string' ? value.phrase : '';
  const argumentaire = typeof value.argumentaire === 'string' ? value.argumentaire : '';
  if (!phrase || !argumentaire) {
    return null;
  }
  const sources = Array.isArray(value.sources) ? value.sources.filter(isValidSourceRecord) : undefined;
  const updatedAt = typeof value.updated_at === 'string' ? value.updated_at : new Date().toISOString();
  const ipHash = typeof value.ip_hash === 'string' ? value.ip_hash : undefined;
  return { phrase, argumentaire, sources, updated_at: updatedAt, ip_hash: ipHash };
}

function isValidSourceRecord(entry: unknown): entry is Record<string, string> {
  if (!entry || typeof entry !== 'object') return false;
  const obj = entry as Record<string, unknown>;
  const titreOk = typeof obj.titre === 'string';
  const auteurOk = typeof obj.auteur === 'string';
  const urlOk = typeof obj.url === 'string' ? isSafeUrl(obj.url) : true;
  return (titreOk || auteurOk || urlOk);
}

function jsonResponse(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin, false),
      'content-type': 'application/json; charset=utf-8'
    }
  });
}

function corsHeaders(origin: string, isPreflight: boolean): Record<string, string> {
  const allowedOrigin = isOriginAllowed(origin) ? origin : 'null';
  const headers: Record<string, string> = {
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-api-key',
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
