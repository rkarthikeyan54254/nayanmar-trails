import { readFile, stat, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const dist = new URL('../dist/', import.meta.url);
const publicData = new URL('../public/data/', import.meta.url);
const graph = JSON.parse(await readFile(new URL('pramana-export-v1.json', publicData), 'utf8'));
const curiosities = JSON.parse(await readFile(new URL('pramana-saint-curiosities-v1.json', publicData), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('data/public-routes-v1.json', dist), 'utf8'));

const expectedRoutes = 2 * (1 + graph.saints.length * 2 + graph.sites.length);
if (manifest.counts.routes !== expectedRoutes) {
  throw new Error(`Expected ${expectedRoutes} public routes, got ${manifest.counts.routes}`);
}
if (graph.saints.length !== 63 || curiosities.stories.length !== 63) {
  throw new Error('Production release requires 63 saints and 63 story hooks');
}

const tamilStories = curiosities.stories.map((item) => item.hook_ta || '');
if (tamilStories.some((value) => !value.trim() || /[A-Za-z]{4,}/.test(value))) {
  throw new Error('Tamil curiosity layer contains missing copy or suspicious Latin translation residue');
}
if (curiosities.stories.some((item) => item.authority_scope !== 'traditional_reference' || item.source_work !== 'Periya Puranam')) {
  throw new Error('Every saint curiosity must remain Periya Puranam traditional_reference');
}

const paths = new Set();
for (const route of manifest.routes) {
  if (paths.has(route.path)) throw new Error(`Duplicate public route: ${route.path}`);
  paths.add(route.path);
  const htmlPath = new URL(`.${route.path}index.html`, dist);
  const html = await readFile(htmlPath, 'utf8');
  for (const token of ['rel="canonical"', 'og:title', 'og:description', 'og:image', 'application/ld+json', 'seo-snapshot']) {
    if (!html.includes(token)) throw new Error(`Missing ${token} in ${route.path}`);
  }
  const ogMatch = html.match(/property="og:image" content="[^"]+\/og\/([^"]+)"/);
  if (!ogMatch) throw new Error(`Missing route OG image in ${route.path}`);
  await stat(new URL(`og/${ogMatch[1]}`, dist));
}

const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
const robots = await readFile(new URL('robots.txt', dist), 'utf8');
if (!sitemap.includes('<urlset') || !robots.includes('Sitemap:')) throw new Error('SEO discovery files missing');
await stat(new URL('health.json', dist));

const assetDir = new URL('assets/', dist);
const files = await readdir(assetDir);
let jsBytes = 0;
let cssBytes = 0;
let jsGzipBytes = 0;
let cssGzipBytes = 0;
for (const file of files) {
  if (!file.endsWith('.js') && !file.endsWith('.css')) continue;
  const body = await readFile(new URL(file, assetDir));
  const gzipped = gzipSync(body, { level: 9 }).length;
  if (file.endsWith('.js')) {
    jsBytes += body.length;
    jsGzipBytes += gzipped;
  }
  if (file.endsWith('.css')) {
    cssBytes += body.length;
    cssGzipBytes += gzipped;
  }
}
const JS_GZIP_BUDGET = 340 * 1024;
const CSS_GZIP_BUDGET = 38 * 1024;
if (jsGzipBytes > JS_GZIP_BUDGET) throw new Error(`JS gzip performance budget exceeded: ${jsGzipBytes} > ${JS_GZIP_BUDGET}`);
if (cssGzipBytes > CSS_GZIP_BUDGET) throw new Error(`CSS gzip performance budget exceeded: ${cssGzipBytes} > ${CSS_GZIP_BUDGET}`);

console.log(`PASS production: ${manifest.counts.routes} indexable routes; ${graph.saints.length}/63 saints; ${curiosities.stories.length}/63 stories; JS ${Math.round(jsBytes/1024)} KiB raw / ${Math.round(jsGzipBytes/1024)} KiB gzip; CSS ${Math.round(cssBytes/1024)} KiB raw / ${Math.round(cssGzipBytes/1024)} KiB gzip.`);
