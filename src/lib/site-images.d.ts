/** The image folders of the site being built, keyed "/content/<folder>/images/<file>" (src/integrations/site-images.ts). */
declare module 'virtual:site-images' {
  const images: Record<string, import('astro').ImageMetadata>;
  export default images;
}
