interface Env {
  KV_ARGUMENTAIRES: KVNamespace;
}

const ARGUMENTAIRES_KEY = "argumentaires.json";
const ALLOWED_ORIGINS = new Set([
  "https://bingo-mascu.mehdiguiraud.net",
  "https://guiraud.gitlab.io",
  "https://guiraud.github.io",
  "http://localhost:8000"
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
        const payload = await request.json();
        await env.KV_ARGUMENTAIRES.put(ARGUMENTAIRES_KEY, JSON.stringify(payload));
        return new Response("OK", {
          status: 201,
          headers: corsHeaders(origin)
        });
      } catch (error) {
        return new Response("Invalid JSON payload", {
          status: 400,
          headers: corsHeaders(origin)
        });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/argumentaires") {
      const data = await env.KV_ARGUMENTAIRES.get(ARGUMENTAIRES_KEY);
      return new Response(data ?? "[]", {
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
