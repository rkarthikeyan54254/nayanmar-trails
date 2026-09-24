import { useEffect, useMemo, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker, StyleSpecification } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point } from 'geojson';
import { GEO_SEEDS } from './geometry';
import { useLocale } from './i18n';

export type EvidenceMode = 'all' | 'edition' | 'tradition' | 'independent';

export type MapStop = {
  siteId: string;
  name: string;
  nameTa: string;
  lng: number;
  lat: number;
  playbackRank: number;
  geometryStatus: 'modern_place_centroid_product_metadata';
  hymnIds: string[];
};

export type CoveragePoint = {
  key: string;
  label: string;
  lng: number;
  lat: number;
  count: number;
};

const gopuramMarkup = `
<svg viewBox="0 0 64 72" aria-hidden="true">
  <circle class="finial" cx="32" cy="3.5" r="2.25"/>
  <path class="finial" d="M29.2 6h5.6l2.2 4H27z"/>
  <path class="tier" d="M25.5 11h13l3.2 6H22.3z"/>
  <path class="band" d="M21.2 18h21.6l2.6 2.8H18.6z"/>
  <path class="tier" d="M19 22h26l3.7 7.2H15.3z"/>
  <path class="band" d="M14 30.3h36l2.6 3.1H11.4z"/>
  <path class="tier" d="M12.5 35h39l4.1 8.3H8.4z"/>
  <path class="band" d="M7 44.7h50l2.4 3.3H4.6z"/>
  <path class="tier" d="M6.4 49.6h51.2L61 58H3z"/>
  <path class="base" d="M2.5 59.7h59v8.8h-59z"/>
  <path class="arch" d="M23.6 49.2c.4-6.2 3.2-9.2 8.4-9.2s8 3 8.4 9.2h-3.2c-.6-4-2.3-6-5.2-6s-4.6 2-5.2 6z"/>
  <path class="door" d="M25.7 48.8h12.6v19.7H25.7z"/>
  <g class="niches">
    <rect x="21.8" y="24.8" width="3.5" height="3" rx=".6"/>
    <rect x="30.2" y="24.8" width="3.5" height="3" rx=".6"/>
    <rect x="38.7" y="24.8" width="3.5" height="3" rx=".6"/>
    <rect x="15.8" y="38" width="3.7" height="3.2" rx=".6"/>
    <rect x="23.7" y="38" width="3.7" height="3.2" rx=".6"/>
    <rect x="36.6" y="38" width="3.7" height="3.2" rx=".6"/>
    <rect x="44.5" y="38" width="3.7" height="3.2" rx=".6"/>
  </g>
</svg>`

const HERITAGE_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'Nayanmar Trails heritage map',
  sources: {
    natural_earth: {
      type: 'raster',
      tiles: ['https://tiles.openfreemap.org/natural_earth/ne2sr/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 6,
      attribution: 'Natural Earth',
    },
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'heritage-background',
      type: 'background',
      paint: { 'background-color': '#0b2729' },
    },
    {
      id: 'heritage-relief',
      type: 'raster',
      source: 'natural_earth',
      maxzoom: 7,
      paint: {
        'raster-opacity': 0.24,
        'raster-saturation': -0.9,
        'raster-contrast': 0.16,
        'raster-brightness-min': 0,
        'raster-brightness-max': 0.36,
      },
    },
    {
      id: 'heritage-wood',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'wood'],
      paint: {
        'fill-color': '#315f49',
        'fill-opacity': 0.34,
      },
    },
    {
      id: 'heritage-grass',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'grass'],
      paint: {
        'fill-color': '#3b6b50',
        'fill-opacity': 0.2,
      },
    },
    {
      id: 'heritage-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: {
        'fill-color': '#35624d',
        'fill-opacity': 0.2,
      },
    },
    {
      id: 'heritage-water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': '#0a3a48',
        'fill-opacity': 0.92,
      },
    },
    {
      id: 'heritage-waterways',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      paint: {
        'line-color': '#3d94ad',
        'line-opacity': 0.58,
        'line-width': 0.8,
      },
    },
    {
      id: 'heritage-boundaries',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: [
        'all',
        ['!=', ['get', 'maritime'], 1],
        ['has', 'admin_level'],
        ['<=', ['get', 'admin_level'], 4],
      ],
      paint: {
        'line-color': '#c0aa72',
        'line-opacity': 0.32,
        'line-width': 0.8,
        'line-dasharray': [2, 2],
      },
    },
  ],
};

function routeCollection(stops: MapStop[]): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: stops.length > 1
      ? [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: stops.map((stop) => [stop.lng, stop.lat]),
          },
        }]
      : [],
  };
}

function coverageCollection(points: CoveragePoint[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      properties: {
        key: point.key,
        label: point.label,
        count: point.count,
      },
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat],
      },
    })),
  };
}

export default function SacredMap({
  routeStops,
  coverage,
  selectedSiteId,
  mode,
  progress,
  epigraphicSiteIds,
  onSelect,
  travelerImage,
  showUnlinkedExemplars = true,
}: {
  routeStops: MapStop[];
  coverage: CoveragePoint[];
  selectedSiteId: string;
  mode: EvidenceMode;
  progress: number;
  epigraphicSiteIds: Set<string>;
  onSelect: (siteId: string) => void;
  travelerImage?: string;
  showUnlinkedExemplars?: boolean;
}) {
  const locale = useLocale();
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  const selectedCallback = useRef(onSelect);
  selectedCallback.current = onSelect;

  const linkedSet = useMemo(
    () => new Set(routeStops.map((stop) => stop.siteId)),
    [routeStops],
  );
  const featuredSiteIds = useMemo(
    () => new Set(['TO01', 'NA22', 'KV01', 'KT087', 'PA01', 'PA08']),
    [],
  );

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapNode.current,
      style: HERITAGE_MAP_STYLE,
      center: [78.95, 10.8],
      zoom: 6.05,
      minZoom: 5.35,
      maxZoom: 11,
      pitch: 4,
      bearing: 0,
      attributionControl: false,
      interactive: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      map.fitBounds(
        [[76.72, 7.85], [80.48, 13.48]],
        {
          padding: { top: 68, right: 34, bottom: 38, left: 34 },
          duration: 0,
          maxZoom: 6.25,
        },
      );
      map.setZoom(Math.min(map.getZoom() + 0.22, 6.5));

      map.addSource('district-coverage', {
        type: 'geojson',
        data: coverageCollection([]),
      });
      map.addLayer({
        id: 'district-coverage-halo',
        type: 'circle',
        source: 'district-coverage',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'count'],
            1, 16,
            15, 28,
            30, 40,
            55, 56,
          ],
          'circle-color': [
            'interpolate', ['linear'], ['get', 'count'],
            1, '#2a8e7f',
            18, '#a89043',
            40, '#e89e42',
            55, '#ffbf58',
          ],
          'circle-opacity': 0.19,
          'circle-blur': 0.72,
          'circle-stroke-width': 0,
        },
      });
      map.addSource('route-ghost', {
        type: 'geojson',
        data: routeCollection([]),
      });
      map.addLayer({
        id: 'route-ghost-glow',
        type: 'line',
        source: 'route-ghost',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#f0aa42',
          'line-width': 7,
          'line-opacity': 0.08,
          'line-blur': 4,
        },
      });
      map.addLayer({
        id: 'route-ghost-line',
        type: 'line',
        source: 'route-ghost',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#eab052',
          'line-width': 1.8,
          'line-opacity': 0.46,
          'line-dasharray': [1.3, 2],
        },
      });

      map.addSource('route-live', {
        type: 'geojson',
        data: routeCollection([]),
      });
      map.addLayer({
        id: 'route-live-line',
        type: 'line',
        source: 'route-live',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#ffd071',
          'line-width': 3.4,
          'line-opacity': 0.96,
          'line-blur': 0.28,
        },
      });
    });

    mapRef.current = map;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateLayers = () => {
      const coverageSource = map.getSource('district-coverage') as maplibregl.GeoJSONSource | undefined;
      coverageSource?.setData(coverageCollection(coverage));

      const ghostSource = map.getSource('route-ghost') as maplibregl.GeoJSONSource | undefined;
      ghostSource?.setData(routeCollection(routeStops));

      const activeStops = routeStops.slice(
        0,
        Math.min(progress + 1, routeStops.length),
      );
      const liveSource = map.getSource('route-live') as maplibregl.GeoJSONSource | undefined;
      liveSource?.setData(routeCollection(activeStops));

      const routeVisible = mode === 'all' || mode === 'edition';
      for (const layerId of ['route-ghost-glow', 'route-ghost-line']) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', routeVisible ? 'visible' : 'none');
        }
      }
      if (map.getLayer('route-live-line')) {
        map.setLayoutProperty('route-live-line', 'visibility', routeVisible ? 'visible' : 'none');
      }
      for (const layerId of ['district-coverage-halo']) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(
            layerId,
            'visibility',
            mode === 'tradition' || mode === 'independent' ? 'none' : 'visible',
          );
        }
      }
    };

    if (map.isStyleLoaded()) updateLayers();
    else map.once('load', updateLayers);
  }, [coverage, mode, progress, routeStops]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    if (mode === 'tradition') return;

    if (mode === 'all' || mode === 'edition') {
      for (const point of coverage.slice(0, 10)) {
        if (point.count < 3) continue;
        const node = document.createElement('div');
        node.className = 'map-district-marker';
        node.style.position = 'absolute';
        node.innerHTML = `
          <span class="district-marker-glow"></span>
          <span class="district-marker-count">${point.count}</span>
        `;
        node.title = locale === 'ta'
          ? `${point.label}: இன்றைய மாவட்ட அடிப்படையில் ${point.count} தேவாரத் தலப் பதிவுகள்`
          : `${point.label}: ${point.count} Tēvāram sthalam entries in the normalized modern district aggregate`;
        node.setAttribute('aria-label', node.title);

        const marker = new maplibregl.Marker({
          element: node,
          anchor: 'center',
        })
          .setLngLat([point.lng, point.lat])
          .addTo(map);

        markerRefs.current.push(marker);
      }
    }

    for (const seed of GEO_SEEDS) {
      const entityId = `tevaram_site.${seed.siteId}`;
      const linked = linkedSet.has(seed.siteId);
      const independent = epigraphicSiteIds.has(seed.siteId);
      if (mode === 'independent' && !independent) continue;
      if (!showUnlinkedExemplars && !linked && mode !== 'independent') continue;

      const selected = selectedSiteId === entityId;
      const node = document.createElement('button');
      node.type = 'button';
      node.style.position = 'absolute';
      node.className = [
        'map-temple-marker',
        linked ? 'linked' : '',
        independent ? 'independent' : '',
        selected ? 'selected' : '',
        featuredSiteIds.has(seed.siteId) ? 'featured' : '',
      ].filter(Boolean).join(' ');
      const routeStop = routeStops.find((stop) => stop.siteId === seed.siteId);
      const seedLabel = locale === 'ta' ? (routeStop?.nameTa || routeStop?.name || seed.name) : seed.name;
      node.innerHTML = `
        <span class="marker-glow"></span>
        <span class="marker-tower">${gopuramMarkup}</span>
        <span class="marker-label">${seedLabel}</span>
      `;
      node.title = locale === 'ta'
        ? `${seedLabel}${linked ? ' · தேர்ந்த நாயன்மாருடன் ஆதாரத் தொடர்புள்ளது' : ''}`
        : `${seed.name}${linked ? ' · evidence-linked to selected saint' : ''}`;
      node.setAttribute('aria-label', node.title);
      node.addEventListener('click', () => selectedCallback.current(entityId));

      const marker = new maplibregl.Marker({
        element: node,
        anchor: 'bottom',
      })
        .setLngLat([seed.lng, seed.lat])
        .addTo(map);

      markerRefs.current.push(marker);
    }

    const active = routeStops[Math.min(progress, Math.max(0, routeStops.length - 1))];
    if (active && (mode === 'all' || mode === 'edition')) {
      const traveler = document.createElement('div');
      traveler.className = travelerImage ? 'map-traveler has-image' : 'map-traveler';
      traveler.style.position = 'absolute';
      traveler.innerHTML = travelerImage
        ? `<img src="${travelerImage}" alt="" /><span></span>`
        : '<span></span>';
      const marker = new maplibregl.Marker({ element: traveler, anchor: 'center' })
        .setLngLat([active.lng, active.lat])
        .addTo(map);
      markerRefs.current.push(marker);
    }
  }, [coverage, epigraphicSiteIds, featuredSiteIds, linkedSet, locale, mode, progress, routeStops, selectedSiteId, showUnlinkedExemplars, travelerImage]);



  return (
    <div className="sacred-map-shell">
      <div ref={mapNode} className="sacred-map-canvas" />
      <div className="map-vignette" />
      <div className="map-compass"><b>{locale === 'ta' ? 'வ' : 'N'}</b><span>✦</span></div>
      <div className="map-neighbor-label karnataka">{locale === 'ta' ? 'கர்நாடகம்' : 'KARNATAKA'}</div>
      <div className="map-neighbor-label kerala">{locale === 'ta' ? 'கேரளம்' : 'KERALA'}</div>
      <div className="map-neighbor-label andhra">{locale === 'ta' ? 'ஆந்திரப் பிரதேசம்' : 'ANDHRA PRADESH'}</div>
      <div className="map-region-title">{locale === 'ta' ? 'தமிழ்நாடு' : 'TAMIL NADU'}</div>
      <div className="map-sea-label east">{locale === 'ta' ? 'வங்காள விரிகுடா' : 'BAY OF BENGAL'}</div>
      <div className="map-sea-label south">{locale === 'ta' ? 'இந்தியப் பெருங்கடல்' : 'INDIAN OCEAN'}</div>
      {mode === 'tradition' && (
        <div className="map-layer-message">
          <strong>{locale === 'ta' ? 'மரபில் வரும் தலங்கள்' : 'Tradition layer'}</strong>
          <p>
            {locale === 'ta'
              ? 'மரபில் தொடர்புடையதாகச் சொல்லப்படும் தலங்களை மட்டும் காட்டுகிறோம்; தெரியாத இடங்களை ஊகித்து வரைபடத்தில் புள்ளியாகச் சேர்ப்பதில்லை.'
              : 'Traditional place associations are shown without fabricating precise coordinates for them.'}
          </p>
        </div>
      )}
    </div>
  );
}
