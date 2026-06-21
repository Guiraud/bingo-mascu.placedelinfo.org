
interface Env {
  KV_ARGUMENTAIRES: KVNamespace;
  TURNSTILE_SECRET?: string;
  API_SHARED_SECRET?: string;
}

const ARGUMENTAIRES_KEY = "argumentaires.json";
const STATIC_ALLOWED_ORIGINS = new Set(
  [
    'https://bingo-mascu.placedelinfo.org',
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
const MAX_SOURCES = 10;

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

    if (request.method === 'POST' && url.pathname === '/api/argumentaires') {
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

    if (request.method === 'GET' && url.pathname === '/api/argumentaires') {
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
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => normalizeStoredItem(item as Record<string, unknown>))
        .filter((item): item is ArgumentaireItem => item !== null);
    }
  } catch (error) {
    console.warn("Invalid JSON stored in KV", error);
  }
  return [];
}

function normalizeEntry(value: Record<string, unknown> | null | undefined, ip?: string): NormalizedEntry | null {
  if (!value || typeof value !== 'object') return null;

  const phraseRaw = typeof value['phrase'] === 'string' ? value['phrase'].trim() : '';
  const argumentaireRaw = typeof value['argumentaire'] === 'string' ? value['argumentaire'].trim() : '';
  if (!phraseRaw || !argumentaireRaw) return null;

  const phrase = escapeHtml(phraseRaw);
  const argumentaire = escapeHtml(argumentaireRaw);
  const phraseKey = phrase.toLowerCase();

  const sourcesInput = Array.isArray(value['sources']) ? value['sources'] : [];
  const sources: Array<Record<string, string>> = [];
  for (const source of sourcesInput.slice(0, MAX_SOURCES)) {
    if (!source || typeof source !== 'object') continue;
    const obj = source as Record<string, unknown>;
    const titreRaw = typeof obj.titre === 'string' ? obj.titre.trim() : '';
    const auteurRaw = typeof obj.auteur === 'string' ? obj.auteur.trim() : '';
    const urlRaw = typeof obj.url === 'string' ? obj.url.trim() : '';
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
      ip_hash: ip ? hashIp(ip) : undefined
    }
  };
}

function normalizeStoredItem(value: Record<string, unknown>): ArgumentaireItem | null {
  if (!value || typeof value !== 'object') return null;
  const phrase = typeof value.phrase === 'string' ? value.phrase : '';
  const argumentaire = typeof value.argumentaire === 'string' ? value.argumentaire : '';
  if (!phrase || !argumentaire) return null;
  const sources = Array.isArray(value.sources) ? value.sources.filter(isValidSourceRecord) : undefined;
  const updatedAt = typeof value.updated_at === 'string' ? value.updated_at : new Date().toISOString();
  const ipHash = typeof value.ip_hash === 'string' ? value.ip_hash : undefined;
  return { phrase, argumentaire, sources, updated_at: updatedAt, ip_hash: ipHash };
}

function isValidSourceRecord(entry: unknown): entry is Record<string, string> {
  if (!entry || typeof entry !== 'object') return false;
  const obj = entry as Record<string, unknown>;
  const urlOk = typeof obj.url === 'string' ? isSafeUrl(obj.url) : true;
  return (typeof obj.titre === 'string' || typeof obj.auteur === 'string' || urlOk);
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
  const allowedOrigin = isOriginAllowed(origin) ? origin : (origin ? 'null' : '*');
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

function isOriginAllowed(origin: string): boolean {
  if (!origin) return true;
  const normalized = origin.toLowerCase();
  if (STATIC_ALLOWED_ORIGINS.has(normalized)) return true;
  try {
    const url = new URL(origin);
    return FLEXIBLE_ALLOWED_SUFFIXES.some(suffix => url.hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip })
    });
    const data = await res.json() as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (Math.imul(31, hash) + ip.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
}
