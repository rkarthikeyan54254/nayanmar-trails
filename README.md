# Nayanmar Trails

Nayanmar Trails is a separate visualization product over **versioned, read-only Pramāṇa exports**. It is intentionally not part of the `pramana` runtime or Railway project.

## First usable deployment

- cinematic Tamil Nadu sacred-geography map with a deliberately schematic land outline;
- all 63 traditional Nayanmar identities from the Pramāṇa graph;
- 276 Tēvāram talam nodes, 798 patikams and typed evidence edges in a pinned export;
- Appar, Sambandar and Sundarar Tēvāram-linked site exploration;
- animated geographic playback across curated modern place centroids;
- saint ↔ talam graph, hymn loci, evidence lenses and fail-closed chronology.

## Authority rule

A glowing route is **not** historical proof. Playback is product inference between evidence-linked endpoints and is rendered as such. Traditional talam identity is not silently collapsed into a single modern temple. Primary-text narrative, traditional reference, edition metadata and independent inscriptional evidence remain separate classes.

## Data source

`public/data/pramana-export-v1.json` is a distilled snapshot of `rkarthikeyan54254/pramana:data/review/nayanmar_tevaram_evidence_graph_v1.json`, pinned by source commit and graph blob SHA inside the export.

`public/data/pramana-tirumurai8-v1.json` is the separately pinned Manikkavasakar / Tirumurai 8 product metadata lane.

`public/data/pramana-saiva-literary-place-links-v1.json` carries cross-layer literary/place context that must not mutate formal Tēvāram sthalam membership. It is used, for example, to keep Uttarakosamangai's Tiruvācakam references separate from the 276-site Tēvāram 1–7 catalogue, and to keep Kōḷaṟu Pathigam 2.085's Tirumaraikadu traditional chronology separate from its formal POTU classification.

Pramāṇa itself is not mutated by this product.

## Local

```bash
npm install
npm run verify:data
npm run dev
```

Production:

```bash
npm run build
npm run start
```


## Reader language policy

Nayanmar Trails uses explicit reader modes rather than mixing Tamil and English as interface copy.

- `EN` keeps navigation, explanations and curated story summaries in English.
- `தமிழ்` keeps the reader-facing experience in Tamil where reviewed Tamil copy exists.
- Tamil is **authored as Tamil**, not translated sentence-by-sentence from English. The target register is clear, idiomatic devotional-magazine Tamil: direct like mainstream Tamil publishing, warm enough for a general reader, and precise enough to preserve Pramāṇa evidence boundaries.
- Avoid English-shaped compounds and academic calques such as “புனிதப் புவியியல்”, “பக்தி நிலப்பரப்பு”, “பயணத் தங்கல்கள்” or “ஆதாரத் தடம்”. Prefer phrases a Tamil editor would naturally write: “திருத்தலங்கள்”, “இன்றும் வாழும் பக்தியின் பாதை”, “பயணத் தலங்கள்”, “ஆதாரங்களைப் பார்க்க”.
- Story hooks may be rewritten structurally in Tamil—sentence order, emphasis and rhythm do not have to mirror English—as long as the underlying traditional claim and authority scope stay unchanged.
- Canonical source text may remain in its original language inside evidence/source views; this is source fidelity, not UI mixing.
- A language is not exposed until its product copy is complete enough to avoid a half-translated experience.

## Saint curiosity layer

`public/data/pramana-saint-curiosities-v1.json` contains one bilingual curiosity hook for each of the 63 Nayanmars. These are concise reader-facing retellings of the Periya Puranam traditional narrative layer. The Tamil hooks are independently edited as native Tamil prose rather than mechanically aligned translations of the English hooks. They are explicitly scoped as `traditional_reference` and are not presented as independently verified historical biography. Product verification requires exactly 63 records, English + Tamil copy for each record, and an exact match to the Pramāṇa 63-saint registry.
## Quest experience

The interactive learning/game layer is specified in `docs/nayanmar-quest-master-design.md`.

Quest is additive to the Explorer: it gamifies story discovery, memory, sacred geography and source literacy without scoring devotion or ranking saints. Pramāṇa remains the evidence authority. English and Tamil are separately authored reader experiences.

The v0.1 production vertical slice is a Kannappar quest with:
- prediction / curiosity hook;
- grounded traditional story reveal;
- memory challenge;
- traditional-place challenge;
- Pramāṇa Detective;
- “Who am I?”;
- unscored reflection;
- local Memory Shrine unlock.

## v1 production contract

Nayanmar Trails v1 is organized around a simple reader loop: **discover → become curious → read a story → explore a place → inspect the source trail → share**.

Production surfaces include:

- a `Start Here` discovery layer for first-time readers;
- one story-first entry point for every one of the 63 Nayanmars;
- stable English and Tamil public URLs for saints, stories and Tēvāram sthalams;
- route-specific Open Graph preview cards for sharing;
- search across saint names/aliases, story text and sthalam names/aliases;
- generated indexable English and Tamil pages with canonical URLs, `hreflang`, structured metadata, sitemap and robots metadata;
- first-party, privacy-minimal interaction events for the core funnel. Search text and other free-form reader input are not sent as analytics properties;
- a `/healthz` production health endpoint and static `/health.json` build manifest;
- fail-visible data loading and an application error boundary;
- CI gates for corpus integrity, public-route coverage, social metadata, performance budget and desktop/mobile visual QA.

The public-site generator is `scripts/build-public-pages.mjs`; the post-build release gate is `scripts/verify-production.mjs`.

### Public route shape

- `/en/nayanmar/<ordinal>-<slug>/`
- `/ta/nayanmar/<ordinal>-<slug>/`
- `/en/story/<ordinal>-<slug>/`
- `/ta/story/<ordinal>-<slug>/`
- `/en/sthalam/<catalogue-id>-<slug>/`
- `/ta/sthalam/<catalogue-id>-<slug>/`

The route parser intentionally keys saints by the canonical 1–63 ordinal and Tēvāram sthalams by catalogue ID, so editorial slug wording can evolve without changing evidence identity.

### Analytics boundary

The v1 event stream records only a generated session identifier, page path, locale, event type and a small allowlisted property object. It does not intentionally collect names, email addresses, location coordinates or search-query text. `Do Not Track` is respected by the browser client.

