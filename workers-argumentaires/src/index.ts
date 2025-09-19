
interface Env {
  KV_ARGUMENTAIRES: KVNamespace;
  TURNSTILE_SECRET?: string;
  API_SHARED_SECRET?: string;
}

const ARGUMENTAIRES_KEY = "argumentaires.json";
const RATE_LIMIT_BUCKET_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_PREFIX = "rate";
const MAX_PHRASE_LENGTH = 160;
const MIN_PHRASE_LENGTH = 3;
const MAX_ARGUMENTAIRE_LENGTH = 600;
const MIN_ARGUMENTAIRE_LENGTH = 20;
const MAX_SOURCES = 8;

const ALLOWED_ORIGINS = new Set<string>([
  'https://bingo-mascu.mehdiguiraud.net',
  'https://guiraud.github.io',
  'https://bingo-mascu-placedelinfo-org-71e588.gitlab.io',
  'https://workers-argumentaires.guiraud.workers.dev',
  'https://dev.workers-argumentaires.guiraud.workers.dev',
  'http://localhost:8000',
  'http://127.0.0.1:8787'
]);

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
      const rateLimited = await enforceRateLimit(env, ip);
      if (!rateLimited.allowed) {
        return jsonResponse({ error: 'rate-limit', retry_in: rateLimited.retryAfter }, 429, origin);
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

async function enforceRateLimit(env: Env, ip: string) {
  const windowId = new Date().toISOString().slice(0, 16);
  const bucket = `${RATE_LIMIT_PREFIX}:${windowId}:${ip}`;
  const existing = await env.KV_ARGUMENTAIRES.get(bucket);
  const currentCount = existing ? Number(existing) : 0;
  if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: RATE_LIMIT_BUCKET_SECONDS };
  }
  await env.KV_ARGUMENTAIRES.put(bucket, String(currentCount + 1), { expirationTtl: RATE_LIMIT_BUCKET_SECONDS });
  return { allowed: true, retryAfter: 0 };
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip })
    });
    const data = await response.json() as { success?: boolean };
    return Boolean(data.success);
  } catch (error) {
    console.warn('Turnstile verification failed', error);
    return false;
  }
}

async function readArgumentaires(env: Env): Promise<ArgumentaireItem[]> {
  const raw = await env.KV_ARGUMENTAIRES.get(ARGUMENTAIRES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => normalizeStoredItem(item as Record<string, unknown>))
        .filter((item): item is ArgumentaireItem => Boolean(item));
    }
  } catch (error) {
    console.warn('Invalid JSON stored in KV', error);
  }
  return [];
}

function normalizeEntry(value: Record<string, unknown>, ip: string): NormalizedEntry | null {
  const phraseRaw = typeof value.phrase === 'string' ? value.phrase.trim() : '';
  const argumentaireRaw = typeof value.argumentaire === 'string' ? value.argumentaire.trim() : '';
  const sourcesRaw = Array.isArray(value.sources) ? value.sources : [];

  if (
    phraseRaw.length < MIN_PHRASE_LENGTH ||
    phraseRaw.length > MAX_PHRASE_LENGTH ||
    argumentaireRaw.length < MIN_ARGUMENTAIRE_LENGTH ||
    argumentaireRaw.length > MAX_ARGUMENTAIRE_LENGTH
  ) {
    return null;
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

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.has(origin);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.length <= 255;
  } catch {
    return false;
  }
}

function hashIp(ip: string): string {
  // Simple reversible obfuscation avoidance: not cryptographic but limits direct disclosure
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  let hash = 0;
  for (let i = 0; i < data.length; i += 1) {
    hash = (hash * 31 + data[i]) >>> 0;
  }
  return hash.toString(16);
}
