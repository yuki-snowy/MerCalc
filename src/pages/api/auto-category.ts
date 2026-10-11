import type { APIRoute } from 'astro';
import { suggestCategory } from '../../services/category';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name : '';

    if (!name.trim()) {
      return new Response(JSON.stringify({ error: '製品名が必要です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const suggestion = suggestCategory(name);
    return new Response(JSON.stringify(suggestion), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'カテゴリ判定に失敗しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
