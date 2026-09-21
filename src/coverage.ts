export type DistrictCentroid = {
  key: string;
  label: string;
  lng: number;
  lat: number;
};

export const DISTRICT_CENTROIDS: DistrictCentroid[] = [
  { key: 'thanjavur', label: 'Thanjavur', lng: 79.1381, lat: 10.7870 },
  { key: 'thiruvarur', label: 'Thiruvarur', lng: 79.6368, lat: 10.7726 },
  { key: 'nagapattinam', label: 'Nagapattinam', lng: 79.8431, lat: 10.7656 },
  { key: 'tiruchirapalli', label: 'Tiruchirappalli', lng: 78.7047, lat: 10.7905 },
  { key: 'villupuram', label: 'Villupuram', lng: 79.4861, lat: 11.9401 },
  { key: 'cuddalore', label: 'Cuddalore', lng: 79.7680, lat: 11.7480 },
  { key: 'kancheepuram', label: 'Kanchipuram', lng: 79.7036, lat: 12.8342 },
  { key: 'tiruvallur', label: 'Tiruvallur', lng: 79.9078, lat: 13.1433 },
  { key: 'madurai', label: 'Madurai', lng: 78.1198, lat: 9.9252 },
  { key: 'tiruvannamalai', label: 'Tiruvannamalai', lng: 79.0747, lat: 12.2253 },
  { key: 'sivaganga', label: 'Sivaganga', lng: 78.4809, lat: 9.8470 },
  { key: 'vellore', label: 'Vellore', lng: 79.1325, lat: 12.9165 },
  { key: 'ariyalur', label: 'Ariyalur', lng: 79.0748, lat: 11.1401 },
  { key: 'karur', label: 'Karur', lng: 78.0766, lat: 10.9601 },
  { key: 'ramanathapuram', label: 'Ramanathapuram', lng: 78.8308, lat: 9.3639 },
  { key: 'chennai', label: 'Chennai', lng: 80.2707, lat: 13.0827 },
  { key: 'pudukkottai', label: 'Pudukkottai', lng: 78.8208, lat: 10.3797 },
  { key: 'virudhunagar', label: 'Virudhunagar', lng: 77.9624, lat: 9.5680 },
  { key: 'tirunelveli', label: 'Tirunelveli', lng: 77.7567, lat: 8.7139 },
  { key: 'coimbatore', label: 'Coimbatore', lng: 76.9558, lat: 11.0168 },
  { key: 'erode', label: 'Erode', lng: 77.7172, lat: 11.3410 },
  { key: 'namakkal', label: 'Namakkal', lng: 78.1674, lat: 11.2194 },
];

export function normalizeDistrict(value: string | null | undefined) {
  if (!value) return 'unknown';
  const source = value
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(dt|district|nic)\b/g, '')
    .replace(/[^a-z]+/g, ' ')
    .trim();

  if (source.includes('thanjavur')) return 'thanjavur';
  if (source.includes('thiruvarur') || source.includes('tiruvarur')) return 'thiruvarur';
  if (source.includes('nagapattinam')) return 'nagapattinam';
  if (source.includes('tiruchirapalli') || source.includes('trich')) return 'tiruchirapalli';
  if (source.includes('villupuram')) return 'villupuram';
  if (source.includes('cuddalore')) return 'cuddalore';
  if (source.includes('kancheepuram') || source.includes('kanchipuram')) return 'kancheepuram';
  if (source.includes('tiruvallur')) return 'tiruvallur';
  if (source.includes('madurai')) return 'madurai';
  if (source.includes('tiruvannamalai')) return 'tiruvannamalai';
  if (source.includes('sivaganga')) return 'sivaganga';
  if (source.includes('vellore')) return 'vellore';
  if (source.includes('ariyalur')) return 'ariyalur';
  if (source.includes('karur')) return 'karur';
  if (source.includes('ramanathapuram')) return 'ramanathapuram';
  if (source.includes('chennai')) return 'chennai';
  if (source.includes('pudukkottai')) return 'pudukkottai';
  if (source.includes('virudhunagar')) return 'virudhunagar';
  if (source.includes('tirunel')) return 'tirunelveli';
  if (source.includes('coimbatore')) return 'coimbatore';
  if (source.includes('erode')) return 'erode';
  if (source.includes('namakkal')) return 'namakkal';
  return 'unknown';
}
