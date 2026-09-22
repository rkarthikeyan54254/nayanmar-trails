import { readFile } from 'node:fs/promises';

const exportPath = new URL('../public/data/pramana-export-v1.json', import.meta.url);
const tirumurai8Path = new URL('../public/data/pramana-tirumurai8-v1.json', import.meta.url);
const geometryPath = new URL('../src/geometry.ts', import.meta.url);
const mapPath = new URL('../src/SacredMap.tsx', import.meta.url);

const doc = JSON.parse(await readFile(exportPath, 'utf8'));
const tirumurai8 = JSON.parse(await readFile(tirumurai8Path, 'utf8'));
const geometryText = await readFile(geometryPath, 'utf8');
const mapText = await readFile(mapPath, 'utf8');

const required = [
  'traditional_reference',
  'primary_text_metadata',
  'edition_metadata',
  'epigraphic_primary',
];

if (doc.meta?.source_repo !== 'rkarthikeyan54254/pramana') {
  throw new Error('Pramana source repo missing');
}
if (doc.saints?.length !== 63) {
  throw new Error(`Expected 63 saints, got ${doc.saints?.length}`);
}
if (doc.sites?.length !== 276) {
  throw new Error(`Expected 276 sites, got ${doc.sites?.length}`);
}
if (doc.patikams?.length !== 798) {
  throw new Error(`Expected 798 patikams, got ${doc.patikams?.length}`);
}
for (const scope of required) {
  if (!doc.meta.authority_semantics?.[scope]) {
    throw new Error(`Missing authority semantics for ${scope}`);
  }
}
if (doc.edges.some((edge) => !edge.authority_scope)) {
  throw new Error('Every edge must retain authority_scope');
}

if (tirumurai8.author?.id !== 'tirumurai8.manikkavacakar') {
  throw new Error('Manikkavasakar must remain a separate Tirumurai 8 companion identity');
}
if (doc.saints.some((saint) => saint.id === tirumurai8.author.id)) {
  throw new Error('Manikkavasakar must not be silently inserted as a 64th Nayanmar');
}
if (tirumurai8.works?.tiruvacakam?.sections !== 51 ||
    tirumurai8.works?.tiruvacakam?.source_units !== 661) {
  throw new Error('Unexpected Tiruvacakam section/source-unit counts');
}
if (tirumurai8.works?.tirukkovaiyar?.source_order_units !== 400) {
  throw new Error('Unexpected Tirukkovaiyar unit count');
}
if (!tirumurai8.meta?.beta_ready || !tirumurai8.meta?.source_commit) {
  throw new Error('Tirumurai 8 product snapshot must be pinned to a beta-ready Pramana source commit');
}
if (!Array.isArray(tirumurai8.loci) || tirumurai8.loci.length < 2) {
  throw new Error('Expected at least two qualified Tirumurai 8 product loci');
}

const siteIds = new Set(doc.sites.map((site) => site.site_id));
const geometryIds = [...geometryText.matchAll(/siteId:\s*'([^']+)'/g)].map((match) => match[1]);
const uniqueGeometryIds = new Set(geometryIds);

if (!geometryIds.length) {
  throw new Error('No product geometry seeds found');
}
if (geometryIds.length !== uniqueGeometryIds.size) {
  throw new Error('Duplicate product geometry seed siteId detected');
}
const unknownGeometryIds = geometryIds.filter((siteId) => !siteIds.has(siteId));
if (unknownGeometryIds.length) {
  throw new Error(`Geometry seeds are not present in Pramana export: ${unknownGeometryIds.join(', ')}`);
}
const missingTirumurai8Geometry = tirumurai8.loci
  .map((locus) => locus.site_id)
  .filter((siteId) => !uniqueGeometryIds.has(siteId) || !siteIds.has(siteId));
if (missingTirumurai8Geometry.length) {
  throw new Error(`Tirumurai 8 loci lack qualified product geometry: ${missingTirumurai8Geometry.join(', ')}`);
}

const exactGeographyRatio = geometryIds.length / doc.sites.length;
if (exactGeographyRatio > 0.25) {
  throw new Error(
    'Product geometry coverage unexpectedly exceeds 25%; review whether inferred coordinates are being promoted as exact geometry',
  );
}

if (!mapText.includes('interactive: false')) {
  throw new Error('Sacred map must remain non-interactive so fixed evidence overlays cannot drift from the viewport');
}
if (mapText.includes('.easeTo(') || mapText.includes('NavigationControl')) {
  throw new Error('Static atlas regression: camera movement or navigation controls reintroduced');
}

const traditionPredicates = new Set([
  'BIRTHPLACE_TRADITION',
  'MUKTI_PLACE_TRADITION',
  'RELATED_PLACE_TRADITION',
]);
const saintsWithTraditionPlayback = new Set(
  doc.edges
    .filter((edge) => traditionPredicates.has(edge.predicate))
    .map((edge) => edge.subject),
);
if (saintsWithTraditionPlayback.size !== 63) {
  throw new Error(
    `Expected tradition-playback coverage for all 63 Nayanmars, got ${saintsWithTraditionPlayback.size}`,
  );
}

console.log(
  `PASS Pramana export ${doc.meta.export_version}: ` +
  `${doc.saints.length} Nayanmars, ${doc.sites.length} sites, ` +
  `${doc.patikams.length} Tēvāram patikams, ${doc.edges.length} edges; ` +
  `${geometryIds.length} deliberately exact product map seeds; ` +
  `tradition playback covers ${saintsWithTraditionPlayback.size}/63; ` +
  `Manikkavasakar remains a separate Naalvar/Tirumurai 8 companion.`,
);
