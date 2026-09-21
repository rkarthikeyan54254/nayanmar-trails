import { useEffect, useMemo, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point } from 'geojson';
import { GEO_SEEDS } from './geometry';

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
<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M29 3h6l2 5H27l2-5Z"/>
  <path d="M24 10h16l3 7H21l3-7Z"/>
  <path d="M19 19h26l3 8H16l3-8Z"/>
  <path d="M14 29h36l3 10H11l3-10Z"/>
  <path d="M9 41h46l3 9H6l3-9Z"/>
  <path d="M4 52h56v8H4z"/>
  <path class="door" d="M25 39h14v21H25z"/>
</svg>`;

function recolorBase(map: MapLibreMap) {
  const layers = map.getStyle().layers ?? [];
  for (const layer of layers) {
    const id = layer.id.toLowerCase();
    try {
      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', '#071c24');
      } else if (layer.type === 'fill') {
        if (/water|ocean|lake|river/.test(id)) {
          map.setPaintProperty(layer.id, 'fill-color', '#062b3b');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.98);
        } else if (/park|wood|forest|landcover|landuse|natural/.test(id)) {
          map.setPaintProperty(layer.id, 'fill-color', '#244a3d');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.52);
        } else if (/building/.test(id)) {
          map.setPaintProperty(layer.id, 'fill-color', '#283c38');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.42);
        }
      } else if (layer.type === 'line') {
        if (/road|highway|street|motorway|trunk|primary|secondary/.test(id)) {
          map.setPaintProperty(layer.id, 'line-color', '#6f6d54');
          map.setPaintProperty(layer.id, 'line-opacity', 0.5);
        } else if (/boundary/.test(id)) {
          map.setPaintProperty(layer.id, 'line-color', '#b8a06b');
          map.setPaintProperty(layer.id, 'line-opacity', 0.28);
        } else if (/water|river/.test(id)) {
          map.setPaintProperty(layer.id, 'line-color', '#3287a2');
          map.setPaintProperty(layer.id, 'line-opacity', 0.6);
        }
      } else if (layer.type === 'symbol') {
        if (/place|city|town|state|country/.test(id)) {
          map.setPaintProperty(layer.id, 'text-color', '#d2c7ac');
          map.setPaintProperty(layer.id, 'text-halo-color', '#061923');
          map.setPaintProperty(layer.id, 'text-halo-width', 1);
        } else if (/road/.test(id)) {
          map.setPaintProperty(layer.id, 'text-color', '#807d6e');
        }
      }
    } catch {
      // Style layers vary over time. Unsupported paint properties are non-fatal.
    }
  }
}

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
}: {
  routeStops: MapStop[];
  coverage: CoveragePoint[];
  selectedSiteId: string;
  mode: EvidenceMode;
  progress: number;
  epigraphicSiteIds: Set<string>;
  onSelect: (siteId: string) => void;
}) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  const selectedCallback = useRef(onSelect);
  selectedCallback.current = onSelect;

  const linkedSet = useMemo(
    () => new Set(routeStops.map((stop) => stop.siteId)),
    [routeStops],
  );

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapNode.current,
      style: 'https://tiles.openfreemap.org/styles/fiord',
      center: [78.95, 10.85],
      zoom: 5.7,
      minZoom: 5.1,
      maxZoom: 11,
      pitch: 28,
      bearing: -4,
      attributionControl: false,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      recolorBase(map);
      map.fitBounds(
        [[76.55, 7.55], [80.75, 13.65]],
        { padding: { top: 45, right: 38, bottom: 45, left: 38 }, duration: 0 },
      );

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
          'circle-opacity': 0.16,
          'circle-blur': 0.72,
          'circle-stroke-width': 0,
        },
      });

      map.addSource('route-ghost', {
        type: 'geojson',
        data: routeCollection([]),
      });
      map.addLayer({
        id: 'route-ghost-line',
        type: 'line',
        source: 'route-ghost',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#d4a04d',
          'line-width': 2.2,
          'line-opacity': 0.5,
          'line-dasharray': [1.2, 2.1],
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
          'line-width': 4.2,
          'line-opacity': 0.98,
          'line-blur': 0.35,
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
      if (map.getLayer('route-ghost-line')) {
        map.setLayoutProperty('route-ghost-line', 'visibility', routeVisible ? 'visible' : 'none');
      }
      if (map.getLayer('route-live-line')) {
        map.setLayoutProperty('route-live-line', 'visibility', routeVisible ? 'visible' : 'none');
      }
      if (map.getLayer('district-coverage-halo')) {
        map.setLayoutProperty(
          'district-coverage-halo',
          'visibility',
          mode === 'tradition' || mode === 'independent' ? 'none' : 'visible',
        );
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

    for (const seed of GEO_SEEDS) {
      const entityId = `tevaram_site.${seed.siteId}`;
      const linked = linkedSet.has(seed.siteId);
      const independent = epigraphicSiteIds.has(seed.siteId);
      if (mode === 'independent' && !independent) continue;

      const selected = selectedSiteId === entityId;
      const node = document.createElement('button');
      node.type = 'button';
      node.className = [
        'map-temple-marker',
        linked ? 'linked' : '',
        independent ? 'independent' : '',
        selected ? 'selected' : '',
      ].filter(Boolean).join(' ');
      node.innerHTML = `
        <span class="marker-glow"></span>
        <span class="marker-tower">${gopuramMarkup}</span>
        <span class="marker-label">${seed.name}</span>
      `;
      node.title = `${seed.name}${linked ? ' · evidence-linked to selected saint' : ''}`;
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
      traveler.className = 'map-traveler';
      traveler.innerHTML = '<span></span>';
      const marker = new maplibregl.Marker({ element: traveler, anchor: 'center' })
        .setLngLat([active.lng, active.lat])
        .addTo(map);
      markerRefs.current.push(marker);
    }
  }, [epigraphicSiteIds, linkedSet, mode, progress, routeStops, selectedSiteId]);

  useEffect(() => {
    const map = mapRef.current;
    const active = routeStops[Math.min(progress, Math.max(0, routeStops.length - 1))];
    if (!map || !active || progress === 0) return;
    map.easeTo({
      center: [active.lng, active.lat],
      zoom: 7.2,
      pitch: 35,
      duration: 900,
    });
  }, [progress, routeStops]);

  return (
    <div className="sacred-map-shell">
      <div ref={mapNode} className="sacred-map-canvas" />
      <div className="map-vignette" />
      <div className="map-compass"><b>N</b><span>✦</span></div>
      <div className="map-region-title">TAMIL NADU</div>
      <div className="map-sea-label east">BAY OF BENGAL</div>
      <div className="map-sea-label south">INDIAN OCEAN</div>
      {mode === 'tradition' && (
        <div className="map-layer-message">
          <strong>Tradition layer</strong>
          <p>
            Traditional place associations are retained in Pramāṇa, but this map does not fabricate precise coordinates for them.
          </p>
        </div>
      )}
    </div>
  );
}
