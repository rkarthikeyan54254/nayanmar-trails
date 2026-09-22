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
- Canonical source text may remain in its original language inside evidence/source views; this is source fidelity, not UI mixing.
- A language is not exposed until its product copy is complete enough to avoid a half-translated experience.

## Saint curiosity layer

`public/data/pramana-saint-curiosities-v1.json` contains one bilingual curiosity hook for each of the 63 Nayanmars. These are concise reader-facing retellings of the Periya Puranam traditional narrative layer. They are explicitly scoped as `traditional_reference` and are not presented as independently verified historical biography. Product verification requires exactly 63 records, English + Tamil copy for each record, and an exact match to the Pramāṇa 63-saint registry.
