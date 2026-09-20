import type { APIRoute } from 'astro';
import { getSite } from '@/config';
import { iconIco } from '@/lib/icons';

/** Browsers ask for this whether or not the page links it. */
export const GET: APIRoute = async () => {
  const body = await iconIco(getSite().slug);
  return new Response(new Uint8Array(body), {
    headers: { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=604800' },
  });
};
