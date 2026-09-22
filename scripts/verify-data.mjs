import { readFile } from 'node:fs/promises';

const exportPath = new URL('../public/data/pramana-export-v1.json', import.meta.url);
const geometryPath = new URL('../src/geometry.ts', import.meta.url);

const doc = JSON.parse(await readFile(exportPath, 'utf8'));
const geometryText = await readFile(geometryPath, 'utf8');

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

const exactGeographyRatio = geometryIds.length / doc.sites.length;
if (exactGeographyRatio > 0.25) {
  throw new Error(
    'Product geometry coverage unexpectedly exceeds 25%; review whether inferred coordinates are being promoted as exact geometry',
  );
}

console.log(
  `PASS Pramana export ${doc.meta.export_version}: ` +
  `${doc.saints.length} saints, ${doc.sites.length} sites, ` +
  `${doc.patikams.length} patikams, ${doc.edges.length} edges; ` +
  `${geometryIds.length} deliberately exact product map seeds`,
);
