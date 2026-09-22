export interface GeoSeed {
  siteId: string;
  name: string;
  nameTa: string;
  lng: number;
  lat: number;
  playbackRank: number;
  geometryStatus: 'modern_place_centroid_product_metadata';
}

// Product-only presentation geometry. These coordinates locate modern towns/cities,
// not ancient roads or proof that a traditional talam is identical to one modern temple.
// Pramana authority remains in the versioned export; this table is deliberately separate.
export const GEO_SEEDS: GeoSeed[] = [
  { siteId: 'TO20', name: 'Tiruvotriyur', nameTa: 'திருவொற்றியூர்', lng: 80.3047, lat: 13.1694, playbackRank: 1, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'TO01', name: 'Kanchipuram', nameTa: 'காஞ்சிபுரம்', lng: 79.7036, lat: 12.8342, playbackRank: 2, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'TO28', name: 'Tirukalukundram', nameTa: 'திருக்கழுக்குன்றம்', lng: 80.0610, lat: 12.6080, playbackRank: 3, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'NA22', name: 'Tiruvannamalai', nameTa: 'திருவண்ணாமலை', lng: 79.0747, lat: 12.2253, playbackRank: 4, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KV01', name: 'Chidambaram', nameTa: 'சிதம்பரம்', lng: 79.6935, lat: 11.3996, playbackRank: 5, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KV14', name: 'Sirkazhi', nameTa: 'சீர்காழி', lng: 79.7360, lat: 11.2390, playbackRank: 6, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KT039', name: 'Mayiladuthurai', nameTa: 'மயிலாடுதுறை', lng: 79.6550, lat: 11.1035, playbackRank: 7, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KT026', name: 'Kumbakonam', nameTa: 'கும்பகோணம்', lng: 79.3881, lat: 10.9602, playbackRank: 8, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KV51', name: 'Tiruvaiyaru', nameTa: 'திருவையாறு', lng: 79.1044, lat: 10.8845, playbackRank: 9, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KV60', name: 'Tiruvanaikaval', nameTa: 'திருவானைக்காவல்', lng: 78.7058, lat: 10.8530, playbackRank: 10, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KT006', name: 'Tiruchirappalli', nameTa: 'திருச்சிராப்பள்ளி', lng: 78.7047, lat: 10.7905, playbackRank: 11, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KT087', name: 'Tiruvarur', nameTa: 'திருவாரூர்', lng: 79.6368, lat: 10.7726, playbackRank: 12, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'KT125', name: 'Vedaranyam', nameTa: 'வேதாரண்யம்', lng: 79.8502, lat: 10.3720, playbackRank: 13, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'PA01', name: 'Madurai', nameTa: 'மதுரை', lng: 78.1198, lat: 9.9252, playbackRank: 14, geometryStatus: 'modern_place_centroid_product_metadata' },
  { siteId: 'PA08', name: 'Rameswaram', nameTa: 'இராமேச்சுரம்', lng: 79.3129, lat: 9.2876, playbackRank: 15, geometryStatus: 'modern_place_centroid_product_metadata' },
];

export const TAMIL_NADU_SCHEMATIC: [number, number][] = [
  [80.32, 13.48], [80.28, 12.75], [79.96, 11.65], [79.86, 10.85],
  [79.92, 10.25], [79.45, 9.35], [79.15, 9.02], [78.15, 8.12],
  [77.55, 8.08], [77.18, 8.48], [77.18, 9.50], [77.55, 10.55],
  [77.92, 11.35], [77.38, 12.05], [77.60, 12.92], [78.25, 13.25],
  [79.22, 13.42], [80.32, 13.48],
];
