import { readFile } from 'node:fs/promises';

const exportPath = new URL('../public/data/pramana-export-v1.json', import.meta.url);
const tirumurai8Path = new URL('../public/data/pramana-tirumurai8-v1.json', import.meta.url);
const saivaPlacesPath = new URL('../public/data/pramana-saiva-literary-place-links-v1.json', import.meta.url);
const curiositiesPath = new URL('../public/data/pramana-saint-curiosities-v1.json', import.meta.url);
const geometryPath = new URL('../src/geometry.ts', import.meta.url);
const mapPath = new URL('../src/SacredMap.tsx', import.meta.url);
const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
const i18nPath = new URL('../src/i18n.tsx', import.meta.url);
const publicRoutesPath = new URL('../src/publicRoutes.ts', import.meta.url);

const doc = JSON.parse(await readFile(exportPath, 'utf8'));
const tirumurai8 = JSON.parse(await readFile(tirumurai8Path, 'utf8'));
const saivaPlaces = JSON.parse(await readFile(saivaPlacesPath, 'utf8'));
const curiosities = JSON.parse(await readFile(curiositiesPath, 'utf8'));
const geometryText = await readFile(geometryPath, 'utf8');
const mapText = await readFile(mapPath, 'utf8');
const appText = await readFile(appPath, 'utf8');
const stylesText = await readFile(stylesPath, 'utf8');
const i18nText = await readFile(i18nPath, 'utf8');
const publicRoutesText = await readFile(publicRoutesPath, 'utf8');

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

if (curiosities.meta?.source_repo !== 'rkarthikeyan54254/pramana' ||
    curiosities.meta?.authority_scope !== 'traditional_reference') {
  throw new Error('Saint curiosity layer must remain pinned to Pramana and explicitly traditional');
}
if (!curiosities.meta?.language_policy?.includes('Tamil copy is independently authored')) {
  throw new Error('Tamil curiosity copy must retain the native-authoring editorial policy');
}
if (!Array.isArray(curiosities.stories) || curiosities.stories.length !== 63) {
  throw new Error(`Expected one curiosity hook for each of 63 Nayanmars, got ${curiosities.stories?.length}`);
}
const saintIds = new Set(doc.saints.map((saint) => saint.id));
const curiosityIds = new Set(curiosities.stories.map((story) => story.saint_id));
if (curiosityIds.size !== 63 || [...saintIds].some((id) => !curiosityIds.has(id))) {
  throw new Error('Saint curiosity coverage must exactly match the 63-saint Pramana registry');
}
for (const story of curiosities.stories) {
  if (story.authority_scope !== 'traditional_reference' ||
      story.source_work !== 'Periya Puranam' ||
      !story.hook_en?.trim() ||
      !story.hook_ta?.trim()) {
    throw new Error(`Invalid bilingual traditional story record: ${story.saint_id}`);
  }
}
if (!appText.includes("LocaleContext.Provider") ||
    !appText.includes("setLocale('en')") ||
    !appText.includes("setLocale('ta')")) {
  throw new Error('English/Tamil reader-mode separation is missing from App');
}
const tamilProductCopy = `${i18nText}\n${appText}\n${mapText}`;
const literalTamilCalques = [
  'புனிதப் புவியியல்',
  'பக்தி நிலப்பரப்பு',
  'பயணத் தங்கல்கள்',
  'உரைத் தலங்கள்',
  'கற்பனை இடமுறைகள்',
  'ஆதாரத் தடம்',
];
for (const phrase of literalTamilCalques) {
  if (tamilProductCopy.includes(phrase)) {
    throw new Error(`Mechanical Tamil product-copy phrase reintroduced: ${phrase}`);
  }
}
if (!mapText.includes("locale === 'ta' ? 'தமிழ்நாடு'") ||
    !mapText.includes("locale === 'ta' ? 'வங்காள விரிகுடா'")) {
  throw new Error('Tamil map labels must stay localized in Tamil reader mode');
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
if (!publicRoutesText.includes("/naalvar/manikkavasakar/") ||
    !publicRoutesText.includes("kind: 'companion'")) {
  throw new Error('Manikkavasakar must have a stable bilingual public companion route');
}
for (const searchTerm of [
  'tiruvempavai',
  'திருவெம்பாவை',
  'tiruppalliyezhuchi',
  'திருப்பள்ளியெழுச்சி',
  'tirupperunturai',
  'திருப்பெருந்துறை',
]) {
  if (!appText.toLowerCase().includes(searchTerm.toLowerCase())) {
    throw new Error(`Manikkavasakar search coverage missing: ${searchTerm}`);
  }
}
if (!appText.includes('unplottedTirumurai8Loci') ||
    !appText.includes('map geometry not yet curated')) {
  throw new Error('Unplotted Tirumurai 8 source loci must remain visible rather than silently disappearing from the product');
}

if (saivaPlaces.meta?.source_repo !== 'rkarthikeyan54254/pramana' ||
    !saivaPlaces.meta?.source_commit) {
  throw new Error('Saiva literary-place snapshot must be pinned to Pramana');
}
const uttaraLinks = saivaPlaces.links.filter(
  (link) => link.object === 'saiva_place.tiru_uttarakosamangai',
);
const uttaraSections = uttaraLinks
  .map((link) => Number(link.subject.match(/\.s(\d+)$/)?.[1]))
  .sort((a, b) => a - b);
if (JSON.stringify(uttaraSections) !== JSON.stringify([2, 6, 13, 16, 17, 18, 19, 20, 48])) {
  throw new Error(`Unexpected Uttarakosamangai Tiruvacakam coverage: ${uttaraSections.join(', ')}`);
}
const uttaraComposition = uttaraLinks.filter(
  (link) => link.predicate === 'SOURCE_HEADER_COMPOSITION_LOCUS',
);
if (uttaraComposition.length !== 1 || !uttaraComposition[0].subject.endsWith('.s06')) {
  throw new Error('Only Tiruvacakam section 6 may be an Uttarakosamangai source-heading composition locus');
}
const s17 = uttaraLinks.find((link) => link.subject.endsWith('.s17'));
if (s17?.predicate !== 'TEXTUALLY_REFERENCES_STHALAM_ALIAS' ||
    s17.normalized_place_ta !== 'திருஉத்தர கோசமங்கை') {
  throw new Error('Section 17 Uttara Mangai alias resolution is missing or over-normalized');
}
const kolaru = saivaPlaces.links.find(
  (link) => link.id === 'literary-place.tevaram.2_85.kt125',
);
if (!kolaru ||
    kolaru.predicate !== 'TRADITIONAL_CHRONOLOGY_LOCUS' ||
    kolaru.formal_tevaram_sthalam_classification !== 'POTU' ||
    kolaru.object !== 'tevaram_site.KT125') {
  throw new Error('Kolaru 2.085 traditional chronology/formal POTU boundary is missing');
}
const formalKolaru = doc.edges.filter(
  (edge) =>
    edge.predicate === 'TEVARAM_PATIKAM_ASSOCIATED_WITH_SITE' &&
    edge.subject === 'tevaram.ifp.2.85',
);
if (formalKolaru.length) {
  throw new Error('Kolaru 2.085 must not be promoted into the formal Tevaram site graph');
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
const mappedTirumurai8Loci = tirumurai8.loci.filter(
  (locus) => typeof locus.site_id === 'string' && locus.site_id.length > 0,
);
const missingTirumurai8Geometry = mappedTirumurai8Loci
  .map((locus) => locus.site_id)
  .filter((siteId) => !uniqueGeometryIds.has(siteId) || !siteIds.has(siteId));
if (missingTirumurai8Geometry.length) {
  throw new Error(`Mapped Tirumurai 8 loci lack qualified product geometry: ${missingTirumurai8Geometry.join(', ')}`);
}

// A source can assert a composition locus before the product has reviewed map geometry.
// Such a locus must remain explicitly unplotted rather than receiving invented coordinates.
const unplottedTirumurai8Loci = tirumurai8.loci.filter(
  (locus) => locus.site_id === null,
);
for (const locus of unplottedTirumurai8Loci) {
  if (
    locus.locus_kind !== 'source_header_composition_locus' ||
    locus.authority_scope !== 'primary_text_metadata' ||
    !String(locus.site_entity_id ?? '').startsWith('saiva_place.') ||
    !String(locus.locus_basis ?? '').includes('No map geometry is asserted')
  ) {
    throw new Error(
      `Unplotted Tirumurai 8 locus is not safely qualified: ${locus.id}`,
    );
  }
}
const tirupperunturaiLocus = tirumurai8.loci.find(
  (locus) => locus.id === 'tirumurai8.locus.tirupperunturai.tiruppalliyezhuchi',
);
if (
  !tirupperunturaiLocus ||
  tirupperunturaiLocus.site_id !== null ||
  tirupperunturaiLocus.site_entity_id !== 'saiva_place.tirupperunturai'
) {
  throw new Error('Tiruppalliyezhuchi/Tirupperunturai must remain an explicit unplotted source-header locus');
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

for (const markerClass of ['map-temple-marker', 'map-district-marker', 'map-traveler']) {
  const absoluteRule = new RegExp('\\.' + markerClass + '[^{]*\\{[^}]*position\\s*:\\s*absolute', 's');
  if (!absoluteRule.test(stylesText) && !mapText.includes("style.position = 'absolute'")) {
    throw new Error(`MapLibre marker positioning regression: ${markerClass} must remain absolutely positioned`);
  }
}

const travelerBlocks = [...stylesText.matchAll(/\.map-traveler\s*\{([^}]*)\}/gs)].map((match) => match[1]);
if (travelerBlocks.some((block) => /animation\s*:\s*(?!none)/.test(block))) {
  throw new Error('MapLibre traveler root must not animate transform; animate child elements instead');
}

const geometryRows = [...geometryText.matchAll(
  /siteId:\s*'([^']+)'[^\n]*lng:\s*([0-9.]+),\s*lat:\s*([0-9.]+)/g,
)].map((match) => ({ siteId: match[1], lng: Number(match[2]), lat: Number(match[3]) }));
const geometryById = new Map(geometryRows.map((row) => [row.siteId, row]));
const kanchipuram = geometryById.get('TO01');
const chidambaram = geometryById.get('KV01');
const madurai = geometryById.get('PA01');
const rameswaram = geometryById.get('PA08');
if (!kanchipuram || !chidambaram || !madurai || !rameswaram) {
  throw new Error('Missing geography sanity anchors');
}
if (!(kanchipuram.lat > chidambaram.lat && chidambaram.lat > madurai.lat && madurai.lat > rameswaram.lat)) {
  throw new Error('Geography sanity failed: Kanchipuram → Chidambaram → Madurai → Rameswaram must descend southward');
}
if (kanchipuram.lat < 12 || kanchipuram.lng < 79 || kanchipuram.lng > 80.5) {
  throw new Error('Geography sanity failed: Kanchipuram centroid is outside the expected northern Tamil Nadu envelope');
}

const traditionPredicates = new Set([
  'BIRTHPLACE_TRADITION',
  'MUKTI_PLACE_TRADITION',
  'RELATED_PLACE_TRADITION',
]);
const traditionEdges = doc.edges.filter((edge) => traditionPredicates.has(edge.predicate));
const saintsWithTraditionPlayback = new Set(traditionEdges.map((edge) => edge.subject));
if (saintsWithTraditionPlayback.size !== 63) {
  throw new Error(
    `Expected tradition-playback coverage for all 63 Nayanmars, got ${saintsWithTraditionPlayback.size}`,
  );
}

const traditionCounts = new Map();
for (const edge of traditionEdges) {
  traditionCounts.set(edge.subject, (traditionCounts.get(edge.subject) ?? 0) + 1);
}
const multiStopSaints = doc.saints.filter((saint) => (traditionCounts.get(saint.id) ?? 0) >= 2);
const singleStopSaints = doc.saints.filter((saint) => (traditionCounts.get(saint.id) ?? 0) === 1);
if (multiStopSaints.length !== 62 || singleStopSaints.length !== 1) {
  throw new Error(
    `Expected 62 Nayanmars with 2+ tradition claims and one single-stop saint; got ${multiStopSaints.length} and ${singleStopSaints.length}`,
  );
}
if (appText.includes('const seen = new Set<string>();')) {
  throw new Error('Playback must not collapse distinct birth/mukti claims merely because they name the same traditional place');
}

console.log(
  `PASS Pramana export ${doc.meta.export_version}: ` +
  `${doc.saints.length} Nayanmars, ${doc.sites.length} sites, ` +
  `${doc.patikams.length} Tēvāram patikams, ${doc.edges.length} edges; ` +
  `${geometryIds.length} deliberately exact product map seeds; ` +
  `tradition playback covers ${saintsWithTraditionPlayback.size}/63 (62 multi-step, 1 single-stop); ` +
  `Manikkavasakar remains a separate Naalvar/Tirumurai 8 companion; 63/63 saint curiosity hooks are bilingual and traditional-reference scoped; Uttarakosamangai spans ${uttaraLinks.length} Tiruvacakam section links; Kolaru 2.085 stays POTU with separate Tirumaraikadu traditional chronology.`,
);
