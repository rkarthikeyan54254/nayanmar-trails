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

`public/data/pramana-export-v1.json` is a distilled snapshot of `rkarthikeyan54254/pramana:data/review/nayanmar_tevaram_evidence_graph_v1.json`, pinned by source commit and graph blob SHA inside the export. Pramāṇa itself is not mutated by this product.

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
