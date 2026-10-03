import type { APIRoute } from 'astro';
import { getSite } from '@/config';

export const GET: APIRoute = ({ site }) => {
  const config = getSite();
  // A town that has not launched is a holding page: ask crawlers to wait.
  if (config.kind === 'town' && config.status !== 'live') {
    return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  const sitemap = new URL('sitemap-index.xml', site).toString();
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
