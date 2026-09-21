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
        map.setPaintProperty(layer.id, 'background-color', '#061923');
      } else if (layer.type === 'fill') {
        if (/water|ocean|lake|river/.test(id)) {
          map.setPaintProperty(layer.id, 'fill-color', '#062b3a');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.98);
        } else if (/park|wood|forest|landcover|landuse|natural/.test(id)) {
          map.setPaintProperty(layer.id, 'fill-color', '#315b46');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.56);
        } else if (/building/.test(id)) {
          map.setPaintProperty(layer.id, 'fill-color', '#263a34');
          map.setPaintProperty(layer.id, 'fill-opacity', 0.18);
        }
      } else if (layer.type === 'line') {
        if (/road|highway|street|motorway|trunk|primary|secondary/.test(id)) {
          map.setPaintProperty(layer.id, 'line-color', '#817652');
          map.setPaintProperty(layer.id, 'line-opacity', 0.13);
        } else if (/rail/.test(id)) {
          map.setPaintProperty(layer.id, 'line-opacity', 0.05);
        } else if (/boundary/.test(id)) {
          map.setPaintProperty(layer.id, 'line-color', '#c4ad77');
          map.setPaintProperty(layer.id, 'line-opacity', 0.24);
        } else if (/water|river/.test(id)) {
          map.setPaintProperty(layer.id, 'line-color', '#3f9ab3');
          map.setPaintProperty(layer.id, 'line-opacity', 0.68);
        }
      } else if (layer.type === 'symbol') {
        if (/road|highway|transit|station|poi|shop|airport|rail|housenumber|village|suburb|neighbourhood/.test(id)) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        } else if (/place|city|state|country/.test(id)) {
          map.setPaintProperty(layer.id, 'text-color', '#d4c7a7');
          map.setPaintProperty(layer.id, 'text-halo-color', '#061923');
          map.setPaintProperty(layer.id, 'text-halo-width', 1.2);
          map.setPaintProperty(layer.id, 'text-opacity', 0.68);
        }
      }
    } catch {
      // The public basemap can evolve. Unsupported paint/layout changes are non-fatal.
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
      center: [78.95, 10.8],
      zoom: 6.05,
      minZoom: 5.35,
      maxZoom: 11,
      pitch: 4,
      bearing: 0,
      attributionControl: false,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      recolorBase(map);
      map.fitBounds(
        [[76.72, 7.85], [80.48, 13.48]],
        {
          padding: { top: 36, right: 34, bottom: 34, left: 34 },
          duration: 0,
          maxZoom: 6.25,
        },
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
          'circle-opacity': 0.19,
          'circle-blur': 0.72,
          'circle-stroke-width': 0,
        },
      });
      map.addLayer({
        id: 'district-coverage-label',
        type: 'symbol',
        source: 'district-coverage',
        filter: ['>=', ['get', 'count'], 10],
        layout: {
          'text-field': ['concat', ['get', 'label'], '  ·  ', ['to-string', ['get', 'count']]],
          'text-size': 9,
          'text-offset': [0, 2.2],
          'text-anchor': 'top',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#d6bf8d',
          'text-halo-color': '#061923',
          'text-halo-width': 1.2,
          'text-opacity': 0.72,
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
          'line-width': 9,
          'line-opacity': 0.12,
          'line-blur': 5,
        },
      });
      map.addLayer({
        id: 'route-ghost-line',
        type: 'line',
        source: 'route-ghost',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#eab052',
          'line-width': 2.7,
          'line-opacity': 0.72,
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
      for (const layerId of ['route-ghost-glow', 'route-ghost-line']) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', routeVisible ? 'visible' : 'none');
        }
      }
      if (map.getLayer('route-live-line')) {
        map.setLayoutProperty('route-live-line', 'visibility', routeVisible ? 'visible' : 'none');
      }
      for (const layerId of ['district-coverage-halo', 'district-coverage-label']) {
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
      zoom: 7,
      pitch: 12,
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
