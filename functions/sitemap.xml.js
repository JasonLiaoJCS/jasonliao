import { listPosts } from './_lib/db.js';

const STATIC_SITEMAP_PATHS = [
  '/',
  '/posts/reason-passion.html',
  '/posts/math-robotics.html',
  '/posts/baseball-engineering.html',
];

function escapeXml(value = ''){
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function normalizeLastmod(value){
  if(!value){
    return '';
  }
  const date = new Date(value);
  if(Number.isNaN(date.getTime())){
    return '';
  }
  return date.toISOString();
}

function renderUrlNode(origin, path, options = {}){
  const lastmod = normalizeLastmod(options.lastmod);
  return `  <url>
    <loc>${escapeXml(`${origin}${path}`)}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
  </url>`;
}

export async function onRequestGet(context){
  const origin = new URL(context.request.url).origin;
  const publicPosts = await listPosts(context.env, {
    visibility: 'public',
    status: 'published',
  });

  const seenPaths = new Set();
  const entries = [];

  STATIC_SITEMAP_PATHS.forEach(path => {
    if(seenPaths.has(path)){
      return;
    }
    seenPaths.add(path);
    entries.push(renderUrlNode(origin, path));
  });

  publicPosts.forEach(post => {
    const path = `/notes/${post.slug}`;
    if(!post.slug || seenPaths.has(path)){
      return;
    }
    seenPaths.add(path);
    entries.push(renderUrlNode(origin, path, {
      lastmod: post.updatedAt || post.publishedAt,
    }));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=600, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
