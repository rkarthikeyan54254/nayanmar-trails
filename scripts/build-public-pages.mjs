import { readFile, writeFile, mkdir, rm, stat, readdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { SAINT_NAMES } from './saint-names.mjs';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const publicData = new URL('../public/data/', import.meta.url);
const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://nayanmartrails.netlify.app').replace(/\/$/, '');
const release = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.COMMIT_REF || process.env.GITHUB_SHA || 'local';

const graph = JSON.parse(await readFile(new URL('pramana-export-v1.json', publicData), 'utf8'));
const curiosities = JSON.parse(await readFile(new URL('pramana-saint-curiosities-v1.json', publicData), 'utf8'));
const shell = await readFile(new URL('index.html', dist), 'utf8');
const storyBySaint = new Map(curiosities.stories.map((item) => [item.saint_id, item]));

const routes = [];
const ogDir = new URL('og/', dist);
await rm(ogDir, { recursive: true, force: true });
await mkdir(ogDir, { recursive: true });

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function saintSlug(saint) {
  return `${String(saint.ordinal).padStart(2, '0')}-${slugify(SAINT_NAMES[saint.id] || saint.label) || 'nayanmar'}`;
}

function siteSlug(site) {
  return `${String(site.site_id).toLowerCase()}-${slugify(site.modern_name_nic || site.label) || 'sthalam'}`;
}

function pathFor(locale, kind, item) {
  if (kind === 'home') return `/${locale}/`;
  if (kind === 'saint') return `/${locale}/nayanmar/${saintSlug(item)}/`;
  if (kind === 'story') return `/${locale}/story/${saintSlug(item)}/`;
  return `/${locale}/sthalam/${siteSlug(item)}/`;
}

function alternatePath(locale, path) {
  return path.replace(/^\/(en|ta)(?=\/)/, `/${locale}`);
}

function titleFor(locale, kind, item) {
  if (kind === 'home') return locale === 'ta'
    ? 'நாயன்மார் பாதைகள் — கதைகள், திருத்தலங்கள், தேவாரம்'
    : 'Nayanmar Trails — Stories, Sthalams and Tēvāram';
  if (kind === 'saint' || kind === 'story') {
    const name = locale === 'ta' ? (item.label_ta || SAINT_NAMES[item.id] || item.label) : (SAINT_NAMES[item.id] || item.label);
    return kind === 'story'
      ? locale === 'ta' ? `${name} — பெரியபுராணக் கதை | நாயன்மார் பாதைகள்` : `${name} — Periya Puranam Story | Nayanmar Trails`
      : `${name} | Nayanmar Trails`;
  }
  const name = locale === 'ta' ? (item.label_ta || item.modern_name_nic || item.label) : (item.modern_name_nic || item.label);
  return `${name} | Nayanmar Trails`;
}

function descriptionFor(locale, kind, item) {
  if (kind === 'home') return locale === 'ta'
    ? 'அறுபத்து மூவர், தேவாரத் திருத்தலங்கள், பெரியபுராணக் கதைகள் மற்றும் ஆதாரங்களுடன் கூடிய தமிழ்ச் சிவபக்திப் பயணம்.'
    : 'Explore the 63 Nayanmars through memorable stories, Tēvāram-linked sthalams, sacred geography and source-aware evidence.';
  if (kind === 'saint' || kind === 'story') {
    const story = storyBySaint.get(item.id);
    if (story) return (locale === 'ta' ? story.hook_ta : story.hook_en).slice(0, 260);
    return locale === 'ta' ? 'நாயன்மார் கதை, திருத்தலங்கள் மற்றும் ஆதாரங்களைப் பாருங்கள்.' : 'Explore this Nayanmar, connected sthalams and the evidence trail.';
  }
  const name = locale === 'ta' ? (item.label_ta || item.modern_name_nic || item.label) : (item.modern_name_nic || item.label);
  return locale === 'ta'
    ? `${name}: தேவாரத் தொடர்புகள், நாயன்மார்கள், பதிகங்கள் மற்றும் ஆதாரங்களைப் பாருங்கள்.`
    : `${name}: explore Tēvāram links, Nayanmars, pathigams and evidence in Nayanmar Trails.`;
}

function cardLabel(kind) {
  if (kind === 'story') return 'PERIYA PURANAM STORY';
  if (kind === 'saint') return 'NAYANMAR';
  if (kind === 'sthalam') return 'TĒVĀRAM STHALAM';
  return 'SACRED GEOGRAPHY';
}

function wrapWords(value, max = 29, maxLines = 3) {
  const words = String(value).replace(/·/g, ' · ').split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

async function makeOg(fileName, heading, kind, subline) {
  const lines = wrapWords(heading, 27, 3);
  const lineSvg = lines.map((line, index) =>
    `<text x="92" y="${245 + index * 78}" font-family="Georgia,serif" font-size="64" font-weight="700" fill="#f1cd86">${esc(line)}</text>`
  ).join('');
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#041923"/>
        <stop offset="0.62" stop-color="#082f3c"/>
        <stop offset="1" stop-color="#03131d"/>
      </linearGradient>
      <radialGradient id="glow" cx="78%" cy="18%" r="70%">
        <stop offset="0" stop-color="#a87434" stop-opacity=".25"/>
        <stop offset="1" stop-color="#a87434" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <path d="M1040 118h56l-8 30h18l-10 34h18l-12 40h18l-18 62h-68l-18-62h18l-12-40h18l-10-34h18z" fill="#dba64d" opacity=".78"/>
    <circle cx="1070" cy="202" r="122" fill="none" stroke="#dba64d" stroke-opacity=".18" stroke-width="2"/>
    <text x="92" y="92" font-family="Arial,sans-serif" font-size="23" font-weight="700" letter-spacing="7" fill="#d4a34e">NAYANMAR TRAILS</text>
    <text x="92" y="145" font-family="Arial,sans-serif" font-size="18" font-weight="600" letter-spacing="4" fill="#72aa9e">${esc(cardLabel(kind))}</text>
    ${lineSvg}
    <text x="92" y="548" font-family="Arial,sans-serif" font-size="24" fill="#b9c4bd">${esc(subline)}</text>
    <line x1="92" y1="580" x2="1108" y2="580" stroke="#d0a257" stroke-opacity=".32"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL(fileName, ogDir)));
}

function jsonLd(locale, kind, item, canonical, description) {
  const name = kind === 'home'
    ? (locale === 'ta' ? 'நாயன்மார் பாதைகள்' : 'Nayanmar Trails')
    : kind === 'saint' || kind === 'story'
      ? (locale === 'ta' ? (item.label_ta || SAINT_NAMES[item.id] || item.label) : (SAINT_NAMES[item.id] || item.label))
      : (locale === 'ta' ? (item.label_ta || item.modern_name_nic || item.label) : (item.modern_name_nic || item.label));
  return {
    '@context': 'https://schema.org',
    '@type': kind === 'story' ? 'Article' : 'WebPage',
    name,
    headline: kind === 'story' ? name : undefined,
    description,
    url: canonical,
    inLanguage: locale === 'ta' ? 'ta' : 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Nayanmar Trails',
      url: siteUrl,
    },
    about: kind === 'home' ? undefined : {
      '@type': 'Thing',
      name,
    },
  };
}

function routeSnapshot(locale, kind, item, title, description) {
  let kicker = locale === 'ta' ? 'நாயன்மார் பாதைகள்' : 'Nayanmar Trails';
  let heading = title.split(' | ')[0].split(' — ')[0];
  if (kind === 'story') kicker = locale === 'ta' ? 'பெரியபுராண மரபிலிருந்து' : 'From Periya Puranam tradition';
  if (kind === 'sthalam') kicker = locale === 'ta' ? 'தேவாரத் திருத்தலம்' : 'Tēvāram sthalam';
  return `<section id="seo-snapshot" lang="${locale}" style="max-width:900px;margin:40px auto;padding:24px;font-family:system-ui;color:#e9ddc3;background:#041923">
    <small style="color:#d4a34e">${esc(kicker)}</small>
    <h1>${esc(heading)}</h1>
    <p>${esc(description)}</p>
    <p><a href="${locale === 'ta' ? '/ta/' : '/en/'}" style="color:#efbd68">Nayanmar Trails</a></p>
  </section>`;
}

async function writeRoute({ locale, kind, item, path, ogFile, ogHeading, ogSubline }) {
  const title = titleFor(locale, kind, item);
  const description = descriptionFor(locale, kind, item);
  const canonical = `${siteUrl}${path}`;
  const otherLocale = locale === 'ta' ? 'en' : 'ta';
  const alternate = `${siteUrl}${alternatePath(otherLocale, path)}`;
  const imageUrl = `${siteUrl}/og/${ogFile}`;
  const schema = JSON.stringify(jsonLd(locale, kind, item, canonical, description)).replace(/</g, '\\u003c');

  let html = shell
    .replace(/<html lang="[^"]*"/, `<html lang="${locale}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}" />`);

  const head = `
    <link rel="canonical" href="${canonical}" data-seo="v1" />
    <link rel="alternate" hreflang="${locale === 'ta' ? 'ta' : 'en'}" href="${canonical}" data-seo="v1" />
    <link rel="alternate" hreflang="${otherLocale}" href="${alternate}" data-seo="v1" />
    <link rel="alternate" hreflang="x-default" href="${siteUrl}/en/" data-seo="v1" />
    <meta property="og:type" content="${kind === 'story' ? 'article' : 'website'}" data-seo="v1" />
    <meta property="og:site_name" content="Nayanmar Trails" data-seo="v1" />
    <meta property="og:title" content="${esc(title)}" data-seo="v1" />
    <meta property="og:description" content="${esc(description)}" data-seo="v1" />
    <meta property="og:url" content="${canonical}" data-seo="v1" />
    <meta property="og:image" content="${imageUrl}" data-seo="v1" />
    <meta property="og:image:width" content="1200" data-seo="v1" />
    <meta property="og:image:height" content="630" data-seo="v1" />
    <meta name="twitter:card" content="summary_large_image" data-seo="v1" />
    <meta name="twitter:title" content="${esc(title)}" data-seo="v1" />
    <meta name="twitter:description" content="${esc(description)}" data-seo="v1" />
    <meta name="twitter:image" content="${imageUrl}" data-seo="v1" />
    <script type="application/ld+json" data-seo="v1">${schema}</script>
  `;
  html = html.replace('</head>', `${head}</head>`);
  html = html.replace('<div id="root"></div>', `${routeSnapshot(locale, kind, item, title, description)}<div id="root"></div>`);

  const target = new URL(`.${path}index.html`, dist);
  await mkdir(dirname(fileURLToPath(target)), { recursive: true });
  await writeFile(target, html);
  routes.push({ locale, kind, path, canonical, title, description, og: `/og/${ogFile}` });
}

const defaultOg = 'home.png';
await makeOg(defaultOg, 'Nayanmar Trails', 'home', 'Stories · Sthalams · Tēvāram · Evidence');

for (const saint of graph.saints) {
  const englishName = SAINT_NAMES[saint.id] || saint.label;
  await makeOg(`saint-${String(saint.ordinal).padStart(2, '0')}.png`, englishName, 'saint', '63 Nayanmars · Sacred geography · Evidence');
}
for (const site of graph.sites) {
  const heading = site.modern_name_nic || site.label || site.site_id;
  await makeOg(`sthalam-${site.site_id.toLowerCase()}.png`, heading, 'sthalam', `${site.patikam_count} linked Tēvāram pathigam${site.patikam_count === 1 ? '' : 's'}`);
}

for (const locale of ['en', 'ta']) {
  await writeRoute({ locale, kind: 'home', item: null, path: pathFor(locale, 'home'), ogFile: defaultOg, ogHeading: 'Nayanmar Trails', ogSubline: '' });
  for (const saint of graph.saints) {
    const ogFile = `saint-${String(saint.ordinal).padStart(2, '0')}.png`;
    await writeRoute({ locale, kind: 'saint', item: saint, path: pathFor(locale, 'saint', saint), ogFile });
    await writeRoute({ locale, kind: 'story', item: saint, path: pathFor(locale, 'story', saint), ogFile });
  }
  for (const site of graph.sites) {
    await writeRoute({ locale, kind: 'sthalam', item: site, path: pathFor(locale, 'sthalam', site), ogFile: `sthalam-${site.site_id.toLowerCase()}.png` });
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${esc(route.canonical)}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('sitemap.xml', dist), sitemap);
await writeFile(new URL('robots.txt', dist), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(new URL('data/public-routes-v1.json', dist), JSON.stringify({
  version: '1.0',
  release,
  base_url: siteUrl,
  counts: {
    routes: routes.length,
    saints: graph.saints.length,
    sthalams: graph.sites.length,
    stories: curiosities.stories.length,
  },
  routes,
}, null, 2));
await writeFile(new URL('health.json', dist), JSON.stringify({
  ok: true,
  service: 'nayanmar-trails',
  release,
  routes: routes.length,
  generated_at: new Date().toISOString(),
}, null, 2));

const rootTitle = 'Nayanmar Trails — Stories, Sthalams and Tēvāram';
const rootDescription = descriptionFor('en', 'home');
let rootHtml = shell
  .replace(/<title>[^<]*<\/title>/, `<title>${rootTitle}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(rootDescription)}" />`);
rootHtml = rootHtml.replace('</head>', `
  <link rel="canonical" href="${siteUrl}/en/" />
  <meta property="og:title" content="${rootTitle}" />
  <meta property="og:description" content="${esc(rootDescription)}" />
  <meta property="og:image" content="${siteUrl}/og/home.png" />
  <meta name="twitter:card" content="summary_large_image" />
</head>`);
await writeFile(new URL('index.html', dist), rootHtml);

console.log(`Generated ${routes.length} indexable public routes and ${graph.saints.length + graph.sites.length + 1} social cards for release ${release}.`);
