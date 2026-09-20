import type { APIRoute } from 'astro';
import { getSite } from '@/config';
import { iconPng } from '@/lib/icons';

/** iOS looks for this at the root when a page is saved to the home screen. */
export const GET: APIRoute = async () => {
  const body = await iconPng(getSite().slug, 180);
  return new Response(new Uint8Array(body), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' },
  });
};
