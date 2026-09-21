import { readFile } from 'node:fs/promises';

const path = new URL('../public/data/pramana-export-v1.json', import.meta.url);
const doc = JSON.parse(await readFile(path, 'utf8'));
const required = ['traditional_reference', 'primary_text_metadata', 'edition_metadata', 'epigraphic_primary'];
if (doc.meta?.source_repo !== 'rkarthikeyan54254/pramana') throw new Error('Pramana source repo missing');
if (doc.saints?.length !== 63) throw new Error(`Expected 63 saints, got ${doc.saints?.length}`);
if (doc.sites?.length !== 276) throw new Error(`Expected 276 sites, got ${doc.sites?.length}`);
if (doc.patikams?.length !== 798) throw new Error(`Expected 798 patikams, got ${doc.patikams?.length}`);
for (const scope of required) {
  if (!doc.meta.authority_semantics?.[scope]) throw new Error(`Missing authority semantics for ${scope}`);
}
if (doc.edges.some((e) => !e.authority_scope)) throw new Error('Every edge must retain authority_scope');
console.log(`PASS Pramana export ${doc.meta.export_version}: ${doc.saints.length} saints, ${doc.sites.length} sites, ${doc.patikams.length} patikams, ${doc.edges.length} edges`);
