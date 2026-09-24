import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));

const graph = await readJson('public/data/pramana-export-v1.json');
const curiosities = await readJson('public/data/pramana-saint-curiosities-v1.json');
const tirumurai8 = await readJson('public/data/pramana-tirumurai8-v1.json');
const literary = await readJson('public/data/pramana-saiva-literary-place-links-v1.json');
const catalogSource = await readFile(new URL('src/questCatalog.ts', root), 'utf8');

const fail = (message) => {
  throw new Error(`Quest grounding gate failed: ${message}`);
};

const expect = (condition, message) => {
  if (!condition) fail(message);
};

const numberedQuests = [
  { key: 'kannappar', id: 'nayanmar.09', birth: 'உடுப்பூர்', mukti: 'திருக்காளத்தி' },
  { key: 'appar', id: 'nayanmar.20', birth: 'ஆமூர்', mukti: 'திருப்புகலூர்' },
  { key: 'sambandar', id: 'nayanmar.27', birth: 'காழி', mukti: 'நல்லூர்ப் பெருமணம்' },
  { key: 'sundarar', id: 'nayanmar.63', birth: 'திருநாவலூர்', mukti: 'திருவஞ்சைக்களம்' },
  { key: 'karaikkal', id: 'nayanmar.23', birth: 'காரைக்கால்', mukti: 'திருவாலங்காடு' },
  { key: 'poosalar', id: 'nayanmar.56', birth: 'திருநின்றவூர்', mukti: 'திருநின்றவூர்' },
];

const placeById = new Map((graph.traditional_places ?? []).map((place) => [place.id, place]));

for (const quest of numberedQuests) {
  expect(catalogSource.includes(`key: '${quest.key}'`), `catalog missing ${quest.key}`);
  const saint = graph.saints.find((item) => item.id === quest.id);
  expect(Boolean(saint), `graph missing saint ${quest.id}`);
  expect(saint.authority_scope === 'traditional_reference', `${quest.id} authority scope changed`);

  const story = curiosities.stories.find((item) => item.saint_id === quest.id);
  expect(Boolean(story), `curiosity missing ${quest.id}`);
  expect(story.authority_scope === 'traditional_reference', `${quest.id} story no longer traditional_reference`);
  expect(Boolean(story.hook_en?.trim()), `${quest.id} English hook missing`);
  expect(Boolean(story.hook_ta?.trim()), `${quest.id} Tamil hook missing`);

  const edges = graph.edges.filter((edge) => edge.subject === quest.id);
  const birthEdge = edges.find((edge) => edge.predicate === 'BIRTHPLACE_TRADITION');
  const muktiEdge = edges.find((edge) => edge.predicate === 'MUKTI_PLACE_TRADITION');
  expect(Boolean(birthEdge), `${quest.id} birthplace tradition missing`);
  expect(Boolean(muktiEdge), `${quest.id} mukti-place tradition missing`);
  expect(birthEdge.authority_scope === 'traditional_reference' && birthEdge.historical_verified === false, `${quest.id} birthplace evidence semantics changed`);
  expect(muktiEdge.authority_scope === 'traditional_reference' && muktiEdge.historical_verified === false, `${quest.id} mukti evidence semantics changed`);
  expect(placeById.get(birthEdge.object)?.label_ta === quest.birth, `${quest.id} birthplace label changed`);
  expect(placeById.get(muktiEdge.object)?.label_ta === quest.mukti, `${quest.id} mukti label changed`);
}

const tevaramExpected = {
  'nayanmar.20': { pathigams: 312, sites: 125 },
  'nayanmar.27': { pathigams: 385, sites: 221 },
  'nayanmar.63': { pathigams: 101, sites: 83 },
};

for (const [saintId, expected] of Object.entries(tevaramExpected)) {
  const patikams = graph.patikams.filter((item) => item.author_saint_id === saintId);
  const ids = new Set(patikams.map((item) => item.id));
  const linkedSites = new Set(
    graph.edges
      .filter((edge) => ids.has(edge.subject) && edge.predicate === 'TEVARAM_PATIKAM_ASSOCIATED_WITH_SITE')
      .map((edge) => edge.object),
  );
  expect(patikams.length === expected.pathigams, `${saintId} pathigam count changed: ${patikams.length}`);
  expect(linkedSites.size === expected.sites, `${saintId} linked sthalam count changed: ${linkedSites.size}`);
}

expect(catalogSource.includes("key: 'manikkavasakar'"), 'catalog missing Manikkavasakar');
expect(tirumurai8.author.id === 'tirumurai8.manikkavacakar', 'Tirumurai 8 author identity changed');
expect(tirumurai8.author.group === 'Naalvar', 'Manikkavasakar is no longer classified as Naalvar');
expect(/outside the numbered 63/i.test(tirumurai8.author.registry_note), 'Manikkavasakar 63-registry exclusion missing');
expect(tirumurai8.works.tiruvacakam.sections === 51, 'Tiruvacakam section count changed');
expect(tirumurai8.works.tiruvacakam.source_units === 661, 'Tiruvacakam source-unit count changed');
expect(tirumurai8.works.tirukkovaiyar.source_order_units === 400, 'Tirukkovaiyar source-order count changed');

const chidambaram = tirumurai8.loci.find((locus) => locus.site_id === 'KV01');
const kazhukkunram = tirumurai8.loci.find((locus) => locus.site_id === 'TO28');
expect(Boolean(chidambaram), 'Tirumurai 8 Koyil/Chidambaram locus missing');
expect(Boolean(kazhukkunram), 'Tirumurai 8 Tirukkazhukkunram locus missing');
expect(kazhukkunram.section_numbers.includes(30), 'Tirukkazhukkunram section 30 locus changed');
expect(/not a biographical journey or historical chronology/i.test(tirumurai8.meta.playback_policy), 'Tirumurai 8 playback safety policy changed');

const uttara = literary.places.find((place) => place.id === 'saiva_place.tiru_uttarakosamangai');
expect(Boolean(uttara), 'Uttarakosamangai literary place missing');
expect(uttara.tevaram_site_catalogue_member === false, 'Uttarakosamangai was promoted into formal Tevaram membership');
expect(literary.links.some((link) => link.object === uttara.id), 'Uttarakosamangai textual links missing');

expect(catalogSource.includes("registryKind: 'naalvar_companion'"), 'Manikkavasakar companion rule missing from catalog');

console.log(
  'PASS Quest cohort grounding: 6 numbered Nayanmar quests + Manikkavasakar companion; bilingual story hooks; traditional-place semantics; Muvar Tevaram counts; Tirumurai 8 locus/registry protections; Uttarakosamangai remains outside formal 276-site membership.',
);
