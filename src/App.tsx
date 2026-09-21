import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point, Polygon } from 'geojson';
import { GEO_SEEDS, TAMIL_NADU_SCHEMATIC } from './geometry';
import type { PramanaExport, Saint, Site } from './types';

type EvidenceMode = 'all' | 'edition' | 'tradition' | 'independent';
type DetailTab = 'hymns' | 'chronology' | 'visits' | 'evidence';

const MUVAR = ['nayanmar.20', 'nayanmar.27', 'nayanmar.63'];
const SAINT_EN: Record<string, string> = {
  'nayanmar.20': 'Appar · Tirunavukkarasar',
  'nayanmar.27': 'Sambandar',
  'nayanmar.63': 'Sundarar · Arurar',
};

const MODE_COPY: Record<EvidenceMode, { title: string; body: string }> = {
  all: { title: 'Layered view', body: 'Tradition, edition metadata, independent evidence and product inference are visible together, but never merged into one claim.' },
  edition: { title: 'Text / edition', body: 'Tēvāram author ↔ patikam ↔ talam links are edition metadata. The luminous route remains product inference.' },
  tradition: { title: 'Tradition', body: 'Traditional saint/place claims are shown as tradition, not as independently verified historical geography.' },
  independent: { title: 'Independent evidence', body: 'Inferred routes are hidden. Only mapped sites with explicit epigraphic evidence are emphasized.' },
};

function authorityLabel(scope: string) {
  if (scope === 'edition_metadata') return 'Edition metadata';
  if (scope === 'traditional_reference') return 'Traditional reference';
  if (scope === 'primary_text_metadata') return 'Primary text metadata';
  if (scope === 'epigraphic_primary') return 'Independent primary evidence';
  return scope.replaceAll('_', ' ');
}

function cleanLabel(label: string) {
  return label.replace(/\s*\([^)]*\)/g, '').trim();
}

export default function App() {
  const [data, setData] = useState<PramanaExport | null>(null);
  const [selectedSaintId, setSelectedSaintId] = useState('nayanmar.20');
  const [selectedSiteId, setSelectedSiteId] = useState('tevaram_site.KV01');
  const [mode, setMode] = useState<EvidenceMode>('all');
  const [tab, setTab] = useState<DetailTab>('visits');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [graphOpen, setGraphOpen] = useState(false);
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    fetch('/data/pramana-export-v1.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((error) => console.error('Unable to load Pramāṇa export', error));
  }, []);

  const saint = useMemo(
    () => data?.saints.find((item) => item.id === selectedSaintId) ?? null,
    [data, selectedSaintId],
  );
  const siteById = useMemo(
    () => new Map((data?.sites ?? []).map((item) => [item.id, item])),
    [data],
  );
  const patikamById = useMemo(
    () => new Map((data?.patikams ?? []).map((item) => [item.id, item])),
    [data],
  );

  const authoredPatikams = useMemo(() => {
    if (!data) return [];
    const ids = new Set(
      data.edges
        .filter((edge) => edge.predicate === 'AUTHOR_OF_TEVARAM_PATIKAM' && edge.subject === selectedSaintId)
        .map((edge) => edge.object),
    );
    return data.patikams.filter((item) => ids.has(item.id));
  }, [data, selectedSaintId]);

  const siteLinks = useMemo(() => {
    const result = new Map<string, string[]>();
    if (!data) return result;
    const authored = new Set(authoredPatikams.map((item) => item.id));
    for (const edge of data.edges) {
      if (edge.predicate !== 'TEVARAM_PATIKAM_ASSOCIATED_WITH_SITE' || !authored.has(edge.subject)) continue;
      result.set(edge.object, [...(result.get(edge.object) ?? []), edge.subject]);
    }
    return result;
  }, [data, authoredPatikams]);

  const epigraphicSiteIds = useMemo(
    () => new Set((data?.inscriptions ?? []).map((item) => item.ifp_site_id).filter(Boolean) as string[]),
    [data],
  );

  const routeStops = useMemo(
    () => GEO_SEEDS
      .map((seed) => ({
        ...seed,
        entity: siteById.get(`tevaram_site.${seed.siteId}`),
        hymnIds: siteLinks.get(`tevaram_site.${seed.siteId}`) ?? [],
      }))
      .filter((item) => item.entity && item.hymnIds.length)
      .sort((a, b) => a.playbackRank - b.playbackRank),
    [siteById, siteLinks],
  );

  const selectedSite = siteById.get(selectedSiteId) ?? null;
  const selectedPatikams = siteLinks.get(selectedSiteId) ?? [];
  const episodeCount = data?.edges.filter(
    (edge) => edge.predicate === 'EPISODE_ABOUT_SAINT' && edge.object === selectedSaintId,
  ).length ?? 0;

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
  }, [selectedSaintId]);

  useEffect(() => {
    if (!playing || routeStops.length < 2) return;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= routeStops.length - 1) {
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, 1300);
    return () => window.clearInterval(timer);
  }, [playing, routeStops.length]);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapNode.current,
      center: [79.05, 10.95],
      zoom: 5.45,
      minZoom: 5,
      maxZoom: 10,
      attributionControl: false,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#061923' } }],
      },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('click', (event) => {
      if (!map.getLayer('sites')) return;
      const features = map.queryRenderedFeatures(event.point, { layers: ['sites'] });
      const id = features[0]?.properties?.id as string | undefined;
      if (id) {
        setSelectedSiteId(id);
        setTab('visits');
      }
    });
    map.on('mousemove', (event) => {
      if (!map.getLayer('sites')) return;
      const features = map.queryRenderedFeatures(event.point, { layers: ['sites'] });
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    const render = () => {
      const land: FeatureCollection<Polygon> = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[...TAMIL_NADU_SCHEMATIC]] },
        }],
      };
      const points: FeatureCollection<Point> = {
        type: 'FeatureCollection',
        features: GEO_SEEDS.map((seed) => {
          const linked = siteLinks.get(`tevaram_site.${seed.siteId}`)?.length ?? 0;
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [seed.lng, seed.lat] },
            properties: {
              id: `tevaram_site.${seed.siteId}`,
              siteId: seed.siteId,
              name: seed.name,
              linked,
              independent: epigraphicSiteIds.has(seed.siteId) ? 1 : 0,
            },
          };
        }),
      };
      const visible = routeStops.slice(0, Math.min(progress + 1, routeStops.length));
      const path: FeatureCollection<LineString> = {
        type: 'FeatureCollection',
        features: visible.length > 1 ? [{
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: visible.map((item) => [item.lng, item.lat]) },
        }] : [],
      };

      const setSource = (id: string, collection: FeatureCollection) => {
        const existing = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
        if (existing) existing.setData(collection);
        else map.addSource(id, { type: 'geojson', data: collection });
      };

      setSource('land-source', land);
      setSource('site-source', points);
      setSource('route-source', path);

      if (!map.getLayer('land')) {
        map.addLayer({
          id: 'land',
          type: 'fill',
          source: 'land-source',
          paint: {
            'fill-color': '#173f3a',
            'fill-opacity': 0.64,
            'fill-outline-color': '#9c9f72',
          },
        });
      }
      if (!map.getLayer('land-outline')) {
        map.addLayer({
          id: 'land-outline',
          type: 'line',
          source: 'land-source',
          paint: { 'line-color': '#d7ad65', 'line-width': 1.4, 'line-opacity': 0.4 },
        });
      }
      if (!map.getLayer('route')) {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route-source',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#ffc96d',
            'line-width': 4,
            'line-opacity': 0.94,
            'line-dasharray': [1.6, 1.5],
          },
        });
      }
      if (!map.getLayer('halo')) {
        map.addLayer({
          id: 'halo',
          type: 'circle',
          source: 'site-source',
          paint: {
            'circle-radius': ['case', ['>', ['get', 'linked'], 0], 15, 8],
            'circle-color': ['case', ['==', ['get', 'independent'], 1], '#70e1c9', '#f0b75b'],
            'circle-opacity': 0.14,
            'circle-blur': 0.7,
          },
        });
      }
      if (!map.getLayer('sites')) {
        map.addLayer({
          id: 'sites',
          type: 'circle',
          source: 'site-source',
          paint: {
            'circle-radius': ['case', ['==', ['get', 'independent'], 1], 8, ['>', ['get', 'linked'], 0], 6.5, 4],
            'circle-color': ['case', ['==', ['get', 'independent'], 1], '#6fe2c9', ['>', ['get', 'linked'], 0], '#efb85f', '#728b88'],
            'circle-stroke-color': '#ffe6ae',
            'circle-stroke-width': 1.2,
            'circle-opacity': ['case', ['>', ['get', 'linked'], 0], 1, 0.42],
          },
        });
      }
      if (!map.getLayer('labels')) {
        map.addLayer({
          id: 'labels',
          type: 'symbol',
          source: 'site-source',
          minzoom: 5.15,
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 11,
            'text-offset': [0, 1.25],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#e9dec8',
            'text-halo-color': '#061923',
            'text-halo-width': 1.3,
          },
        });
      }

      map.setLayoutProperty('route', 'visibility', mode === 'all' || mode === 'edition' ? 'visible' : 'none');
      const siteVisibility = mode === 'tradition' ? 'none' : 'visible';
      for (const layer of ['halo', 'sites', 'labels']) map.setLayoutProperty(layer, 'visibility', siteVisibility);
      const filter: maplibregl.FilterSpecification | null = mode === 'independent'
        ? ['==', ['get', 'independent'], 1]
        : null;
      for (const layer of ['halo', 'sites', 'labels']) map.setFilter(layer, filter);
    };

    if (map.isStyleLoaded()) render();
    else map.once('load', render);
  }, [data, routeStops, progress, mode, siteLinks, epigraphicSiteIds]);

  const activeStop = routeStops[Math.min(progress, Math.max(routeStops.length - 1, 0))];
  useEffect(() => {
    if (!activeStop || !mapRef.current || (!playing && progress === 0)) return;
    mapRef.current.easeTo({ center: [activeStop.lng, activeStop.lat], zoom: 6.6, duration: 850 });
  }, [activeStop, playing, progress]);

  if (!data) {
    return <div className="loading"><div className="loading-mark">♜</div><div>Opening the Pramāṇa evidence atlas…</div></div>;
  }

  const saintName = SAINT_EN[selectedSaintId] ?? saint?.label ?? 'Nayanmar';
  const independentEdges = data.edges.filter((edge) => edge.authority_scope === 'epigraphic_primary').length;
  const progressPct = routeStops.length <= 1 ? 0 : (progress / (routeStops.length - 1)) * 100;

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand"><span className="gopuram">♜</span><div><strong>Nayanmar Trails</strong><small>DEVOTION CONNECTS LANDS · PRAMĀṆA EVIDENCE ATLAS</small></div></div>
        <nav>
          <button className="active">Explore</button>
          <button onClick={() => document.querySelector('.timeline')?.scrollIntoView({ behavior: 'smooth' })}>Timeline</button>
          <button onClick={() => setTab('visits')}>Temples</button>
          <button onClick={() => setTab('hymns')}>Hymns</button>
          <button onClick={() => setGraphOpen(true)}>Graph</button>
          <button onClick={() => setTab('evidence')}>Evidence</button>
        </nav>
        <div className="version">Pramāṇa <b>{data.meta.export_version}</b></div>
      </header>

      <section className="hero">
        <span>ANCIENT PATHS · LIVING EVIDENCE</span>
        <h1>Trace the living journeys of the Nayanmars</h1>
        <p>Saints, temples, hymns and sacred geography — with every evidence class kept visible and honest.</p>
      </section>

      <section className="filters">
        <label>Saint
          <select value={selectedSaintId} onChange={(event) => setSelectedSaintId(event.target.value)}>
            {data.saints.map((item) => (
              <option key={item.id} value={item.id}>{item.ordinal}. {SAINT_EN[item.id] ?? item.label}</option>
            ))}
          </select>
        </label>
        <div className="quick">
          {MUVAR.map((id) => <button key={id} className={selectedSaintId === id ? 'active' : ''} onClick={() => setSelectedSaintId(id)}>{SAINT_EN[id]?.split(' · ')[0]}</button>)}
        </div>
        <div className="mode">
          {(['all', 'edition', 'tradition', 'independent'] as EvidenceMode[]).map((item) => (
            <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>
              {item === 'all' ? 'All layers' : item === 'edition' ? 'Text / edition' : item === 'tradition' ? 'Tradition' : 'Independent'}
            </button>
          ))}
        </div>
      </section>

      <section className="workspace">
        <aside className="panel saint-card">
          <div className="portrait"><span>ॐ</span><i>{saint?.ordinal}</i></div>
          <small className="eyebrow">NAYANMAR {saint?.ordinal}</small>
          <h2>{saintName}</h2>
          <div className="tamil">{saint?.label_ta}</div>
          <Badge kind="tradition">TRADITIONAL IDENTITY</Badge>
          <blockquote>“A map can show devotion without pretending that every line is a historical road.”</blockquote>
          <div className="stat-grid">
            <Stat value={authoredPatikams.length} label="Tēvāram patikams" />
            <Stat value={siteLinks.size} label="edition-linked talams" />
            <Stat value={episodeCount} label="Periya Puranam links" />
            <Stat value={routeStops.length} label="mapped exemplars" />
          </div>
          <div className="rule"><h3>Authority boundary</h3><p>{MODE_COPY[mode].body}</p></div>
          <div className="tiny-legend"><span><i className="gold" />edition</span><span><i className="teal" />epigraphy</span><span><i className="purple" />inference</span></div>
        </aside>

        <section className="panel map-card">
          <div className="map-pill"><span>{MODE_COPY[mode].title}</span><b>{routeStops.length} mapped evidence-linked stops</b></div>
          <div ref={mapNode} className="map" />
          <div className="ocean east">BAY OF<br />BENGAL</div>
          <div className="ocean south">INDIAN OCEAN</div>
          <div className="compass">N<br />✦</div>
          <div className="map-legend">
            <b>Legend</b>
            <span>● Pramāṇa talam node</span>
            <span>···· geographic playback — inference</span>
            <span>◆ explicit epigraphic evidence</span>
            <small>Land outline and playback geometry are product presentation, not source evidence.</small>
          </div>
          {graphOpen && <div className="overlay"><Network saint={saint} stops={routeStops.slice(0, 12)} /><p>Edges shown here are selected saint → Tēvāram-linked talam relationships. Layout itself has no evidentiary meaning.</p><button onClick={() => setGraphOpen(false)}>Close graph</button></div>}
        </section>

        <aside className="panel detail-card">
          <div className="tabs">
            {(['hymns', 'chronology', 'visits', 'evidence'] as DetailTab[]).map((item) => (
              <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>
                {item === 'visits' ? 'Temple Visits' : item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <div className="detail">
            <div className="temple-head"><span>♜</span><div><h2>{selectedSite ? cleanLabel(selectedSite.label) : 'Select a site'}</h2><p>{selectedSite?.label_ta || selectedSite?.modern_name_nic || ''}</p></div></div>
            {selectedSite && <>
              <div className="chips"><span>{selectedSite.site_id}</span><span>{selectedSite.patikam_count} total patikams</span><span>{selectedPatikams.length} by {saintName.split(' · ')[0]}</span></div>
              {tab === 'visits' && <Visits site={selectedSite} saintName={saintName} count={selectedPatikams.length} />}
              {tab === 'hymns' && <Hymns ids={selectedPatikams} patikamById={patikamById} />}
              {tab === 'chronology' && <Chronology />}
              {tab === 'evidence' && <Evidence site={selectedSite} data={data} />}
              <button className="focus" onClick={() => {
                const seed = GEO_SEEDS.find((item) => item.siteId === selectedSite.site_id);
                if (seed) mapRef.current?.easeTo({ center: [seed.lng, seed.lat], zoom: 8, duration: 750 });
              }}>Focus on map →</button>
            </>}
          </div>
        </aside>
      </section>

      <section className="bottom">
        <div className="panel timeline">
          <div className="section-head"><div><h3>Pilgrimage playback</h3><p>Geographic presentation order — <b>not a claimed historical chronology.</b></p></div><Badge kind="inference">INFERENCE</Badge></div>
          <div className="play-row">
            <button className="play" disabled={routeStops.length < 2} onClick={() => {
              if (progress >= routeStops.length - 1) setProgress(0);
              setPlaying((value) => !value);
            }}>{playing ? 'Ⅱ' : '▶'}</button>
            <div className="track"><div className="fill" style={{ width: `${progressPct}%` }} />{routeStops.map((stop, index) => (
              <button key={stop.siteId} title={stop.name} className={`stop ${index <= progress ? 'reached' : ''}`} style={{ left: `${routeStops.length <= 1 ? 0 : index / (routeStops.length - 1) * 100}%` }} onClick={() => { setProgress(index); setSelectedSiteId(`tevaram_site.${stop.siteId}`); }} />
            ))}</div>
            <div className="now">{activeStop ? <><b>{activeStop.name}</b><small>{activeStop.hymnIds.length} linked patikam{activeStop.hymnIds.length === 1 ? '' : 's'}</small></> : <><b>No inferred playback</b><small>This saint has no mapped seed stops.</small></>}</div>
          </div>
        </div>

        <div className="panel graph-mini"><h3>Saint ↔ Talam connections</h3><Network saint={saint} stops={routeStops.slice(0, 8)} /></div>

        <div className="panel lens">
          <h3>Evidence lens</h3>
          <Meter label="Tradition" width={mode === 'all' || mode === 'tradition' ? 100 : 25} />
          <Meter label="Text / edition" width={mode === 'all' || mode === 'edition' ? 76 : 24} />
          <Meter label="Independent" width={mode === 'independent' ? 100 : 14} />
          <p>Bar width is viewing emphasis, not a probability of truth.</p>
        </div>

        <div className="panel totals">
          <Stat value={data.meta.counts.saints} label="Saints" />
          <Stat value={data.meta.counts.tevaram_sites} label="Tēvāram sites" />
          <Stat value={data.meta.counts.tevaram_patikams} label="Patikams" />
          <Stat value={independentEdges} label="Independent edges" />
        </div>
      </section>

      <footer><strong>♜ Nayanmar Trails</strong><span>Separate product · versioned read-only Pramāṇa foundation</span><span>Source {data.meta.source_commit.slice(0, 10)}</span></footer>
    </main>
  );
}

function Badge({ kind, children }: { kind: 'tradition' | 'edition' | 'independent' | 'inference'; children: React.ReactNode }) {
  return <span className={`badge ${kind}`}>{children}</span>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="stat"><b>{value}</b><small>{label}</small></div>;
}

function Visits({ site, saintName, count }: { site: Site; saintName: string; count: number }) {
  return <div className="text"><Badge kind="edition">EDITION METADATA</Badge><p><b>{saintName}</b> is linked to {count} Tēvāram patikam{count === 1 ? '' : 's'} associated with this traditional talam in the current Pramāṇa graph.</p><dl><dt>Traditional region</dt><dd>{site.traditional_location_class || 'Not supplied'}</dd><dt>Modern catalog context</dt><dd>{site.modern_name_nic || [site.taluk, site.district].filter(Boolean).join(', ') || 'Not supplied'}</dd></dl><p className="caution">A traditional talam is not silently equated with one modern temple.</p></div>;
}

function Hymns({ ids, patikamById }: { ids: string[]; patikamById: Map<string, { tirumurai: number; patikam: number }> }) {
  return <div className="text"><Badge kind="edition">TĒVĀRAM LOCI</Badge>{ids.length ? <ul className="hymns">{ids.slice(0, 10).map((id) => { const item = patikamById.get(id); return <li key={id}><span>♪</span><div><b>{id.replace('tevaram.ifp.', 'Tēvāram ')}</b><small>{item ? `Tirumurai ${item.tirumurai} · Patikam ${item.patikam}` : 'Edition locus'}</small></div></li>; })}</ul> : <p>No patikam by the selected saint is linked to this mapped talam.</p>}</div>;
}

function Chronology() {
  return <div className="text"><Badge kind="inference">FAIL-CLOSED CHRONOLOGY</Badge><p>The current Pramāṇa Nayanmar graph does <b>not</b> assert a complete historical visit sequence or precise saint chronology. Nayanmar Trails therefore does not promote map playback into a chronology claim.</p><p>A future versioned Pramāṇa chronology export can replace this state without changing the authority contract.</p></div>;
}

function Evidence({ site, data }: { site: Site; data: PramanaExport }) {
  const inscriptions = data.inscriptions.filter((item) => item.ifp_site_id === site.site_id);
  return <div className="text"><Badge kind="edition">{authorityLabel(site.authority_scope).toUpperCase()}</Badge><p>This talam node is presented as <b>{authorityLabel(site.authority_scope)}</b>.</p>{inscriptions.length ? inscriptions.map((item) => <div className="inscription" key={item.id}><Badge kind="independent">INDEPENDENT PRIMARY EVIDENCE</Badge><b>{item.label}</b><p>{item.historical_scope}</p></div>) : <p className="caution">No explicit epigraphic edge is attached to this mapped talam in the current export. That is not evidence of historical absence.</p>}</div>;
}

function Meter({ label, width }: { label: string; width: number }) {
  return <div className="meter"><span>{label}</span><div><i style={{ width: `${width}%` }} /></div></div>;
}

function Network({ saint, stops }: { saint: Saint | null; stops: Array<{ siteId: string; name: string; hymnIds: string[] }> }) {
  const w = 320, h = 130, cx = 160, cy = 64, rx = 120, ry = 45;
  return <svg className="network" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Saint to talam graph">
    {stops.map((stop, index) => {
      const angle = index / Math.max(stops.length, 1) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * rx;
      const y = cy + Math.sin(angle) * ry;
      return <g key={stop.siteId}><line x1={cx} y1={cy} x2={x} y2={y} /><circle cx={x} cy={y} r={4 + Math.min(stop.hymnIds.length / 3, 4)} /><text x={x} y={y + 14} textAnchor="middle">{stop.name.slice(0, 11)}</text></g>;
    })}
    <circle className="center" cx={cx} cy={cy} r="14" />
    <text className="center-text" x={cx} y={cy + 3} textAnchor="middle">{saint?.ordinal ?? '—'}</text>
  </svg>;
}
