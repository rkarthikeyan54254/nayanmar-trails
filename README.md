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
