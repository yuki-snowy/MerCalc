import type { APIContext } from 'astro';

/** Astro APIRoute を単体で叩くための最小コンテキスト */
export function createApiContext(request: Request): APIContext {
  return { request } as APIContext;
}

export function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
