import { useEffect, useMemo, useState } from 'react';
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
  return scope.replace(/_/g, ' ');
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


  if (!data) {
    return <div className="loading"><div className="loading-mark"><GopuramIcon /></div><div>Opening the Pramāṇa evidence atlas…</div></div>;
  }

  const saintName = SAINT_EN[selectedSaintId] ?? saint?.label ?? 'Nayanmar';
  const independentEdges = data.edges.filter((edge) => edge.authority_scope === 'epigraphic_primary').length;
  const progressPct = routeStops.length <= 1 ? 0 : (progress / (routeStops.length - 1)) * 100;

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand"><span className="gopuram"><GopuramIcon /></span><div><strong>Nayanmar Trails</strong><small>DEVOTION CONNECTS LANDS · PRAMĀṆA EVIDENCE ATLAS</small></div></div>
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
          <div className="portrait"><span><GopuramIcon /></span><i>{saint?.ordinal}</i></div>
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
          <SacredMap
            routeStops={routeStops}
            selectedSiteId={selectedSiteId}
            mode={mode}
            progress={progress}
            epigraphicSiteIds={epigraphicSiteIds}
            siteLinks={siteLinks}
            onSelect={(siteId) => {
              setSelectedSiteId(siteId);
              setTab('visits');
            }}
          />
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
            <div className="temple-head"><span><GopuramIcon /></span><div><h2>{selectedSite ? cleanLabel(selectedSite.label) : 'Select a site'}</h2><p>{selectedSite?.label_ta || selectedSite?.modern_name_nic || ''}</p></div></div>
            {selectedSite && <>
              <div className="chips"><span>{selectedSite.site_id}</span><span>{selectedSite.patikam_count} total patikams</span><span>{selectedPatikams.length} by {saintName.split(' · ')[0]}</span></div>
              {tab === 'visits' && <Visits site={selectedSite} saintName={saintName} count={selectedPatikams.length} />}
              {tab === 'hymns' && <Hymns ids={selectedPatikams} patikamById={patikamById} />}
              {tab === 'chronology' && <Chronology />}
              {tab === 'evidence' && <Evidence site={selectedSite} data={data} />}
              <button className="focus" onClick={() => {
                setSelectedSiteId(selectedSite.id);
                document.querySelector('.map-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

      <footer><strong><GopuramIcon /> Nayanmar Trails</strong><span>Separate product · versioned read-only Pramāṇa foundation</span><span>Source {data.meta.source_commit.slice(0, 10)}</span></footer>
    </main>
  );
}


function GopuramIcon({ className = '' }: { className?: string }) {
  return <svg className={\`gopuram-icon \${className}\`} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M27 5h10l2.5 7H24.5L27 5Z" />
    <path d="M21 14h22l3 8H18l3-8Z" />
    <path d="M16 24h32l3 9H13l3-9Z" />
    <path d="M11 35h42l3 10H8l3-10Z" />
    <path d="M7 48h50v9H7z" />
    <path d="M25 42h14v15H25z" className="door" />
    <circle cx="24" cy="18" r="1.8" />
    <circle cx="32" cy="18" r="1.8" />
    <circle cx="40" cy="18" r="1.8" />
    <circle cx="20" cy="29" r="1.8" />
    <circle cx="28" cy="29" r="1.8" />
    <circle cx="36" cy="29" r="1.8" />
    <circle cx="44" cy="29" r="1.8" />
  </svg>;
}

type SacredStop = {
  siteId: string;
  name: string;
  nameTa: string;
  lng: number;
  lat: number;
  playbackRank: number;
  geometryStatus: 'modern_place_centroid_product_metadata';
  entity?: Site;
  hymnIds: string[];
};

function SacredMap({
  routeStops,
  selectedSiteId,
  mode,
  progress,
  epigraphicSiteIds,
  siteLinks,
  onSelect,
}: {
  routeStops: SacredStop[];
  selectedSiteId: string;
  mode: EvidenceMode;
  progress: number;
  epigraphicSiteIds: Set<string>;
  siteLinks: Map<string, string[]>;
  onSelect: (siteId: string) => void;
}) {
  const width = 920;
  const height = 570;
  const bounds = { minLng: 76.75, maxLng: 80.55, minLat: 7.85, maxLat: 13.65 };
  const project = (lng: number, lat: number) => {
    const x = 60 + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - 120);
    const y = 40 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (height - 80);
    return [x, y] as const;
  };
  const landPoints = TAMIL_NADU_SCHEMATIC.map(([lng, lat]) => project(lng, lat).join(',')).join(' ');
  const fullRoute = routeStops.map((stop) => project(stop.lng, stop.lat));
  const activeRoute = routeStops.slice(0, Math.min(progress + 1, routeStops.length)).map((stop) => project(stop.lng, stop.lat));
  const pathFor = (points: readonly (readonly [number, number])[]) =>
    points.length < 2 ? '' : points.map(([x, y], index) => \`\${index ? 'L' : 'M'} \${x.toFixed(1)} \${y.toFixed(1)}\`).join(' ');
  const isEditionVisible = mode === 'all' || mode === 'edition';
  const isSiteVisible = mode !== 'tradition';

  return <div className="map sacred-map" role="img" aria-label="Evidence-aware Tamil Nadu sacred geography">
    <svg viewBox={\`0 0 \${width} \${height}\`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="landGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#315f4c" />
          <stop offset="0.52" stopColor="#173f3a" />
          <stop offset="1" stopColor="#0b2b31" />
        </linearGradient>
        <radialGradient id="mapGlow" cx="55%" cy="43%" r="60%">
          <stop offset="0" stopColor="#2e7166" stopOpacity=".32" />
          <stop offset=".7" stopColor="#0b2d36" stopOpacity=".08" />
          <stop offset="1" stopColor="#041923" stopOpacity="0" />
        </radialGradient>
        <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="templeGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="contours" width="54" height="38" patternUnits="userSpaceOnUse">
          <path d="M-5 24 C12 6 30 38 58 14" fill="none" stroke="#6f9a7b" strokeOpacity=".08" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width={width} height={height} fill="#061923" />
      <rect width={width} height={height} fill="url(#mapGlow)" />
      <g opacity=".8">
        <path d="M90 70 C170 115 196 178 172 245 C145 320 126 402 166 500" fill="none" stroke="#1c6071" strokeOpacity=".22" strokeWidth="2" />
        <path d="M800 70 C750 146 760 246 825 320 C865 368 882 435 860 505" fill="none" stroke="#1c6071" strokeOpacity=".18" strokeWidth="2" />
      </g>

      <polygon points={landPoints} fill="url(#landGradient)" stroke="#c19a58" strokeOpacity=".48" strokeWidth="2" />
      <polygon points={landPoints} fill="url(#contours)" opacity=".9" />

      <g className="terrain-lines" opacity=".28">
        <path d="M180 145 C245 116 304 145 342 198 C374 243 392 330 355 410" />
        <path d="M215 165 C270 144 319 171 351 220 C381 267 385 325 365 374" />
        <path d="M250 186 C294 168 332 193 360 232" />
      </g>
      <g className="rivers" opacity=".42">
        <path d="M300 316 C380 300 452 320 520 351 C579 378 635 372 716 351" />
        <path d="M418 226 C465 244 515 260 579 252" />
        <path d="M361 425 C426 407 492 419 558 449" />
      </g>

      {isEditionVisible && fullRoute.length > 1 && <>
        <path className="route route-ghost" d={pathFor(fullRoute)} />
        {activeRoute.length > 1 && <path className="route route-live" d={pathFor(activeRoute)} filter="url(#routeGlow)" />}
      </>}

      {isSiteVisible && GEO_SEEDS.map((seed) => {
        const [x, y] = project(seed.lng, seed.lat);
        const siteId = \`tevaram_site.\${seed.siteId}\`;
        const linked = siteLinks.get(siteId)?.length ?? 0;
        const independent = epigraphicSiteIds.has(seed.siteId);
        if (mode === 'independent' && !independent) return null;
        const selected = selectedSiteId === siteId;
        const active = linked > 0;
        return <g
          key={seed.siteId}
          className={\`temple-marker \${active ? 'linked' : ''} \${independent ? 'independent' : ''} \${selected ? 'selected' : ''}\`}
          transform={\`translate(\${x} \${y})\`}
          onClick={() => onSelect(siteId)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(siteId); }}
          aria-label={\`\${seed.name}, \${linked} linked patikams\`}
        >
          <circle className="marker-halo" r={selected ? 22 : active ? 16 : 11} />
          <circle className="marker-core" r={selected ? 10 : active ? 8 : 6} />
          <g transform="translate(-6 -7) scale(.19)" className="marker-gopuram"><GopuramIcon /></g>
          {(active || selected) && <text y={selected ? 28 : 24} textAnchor="middle">{seed.name}</text>}
          {independent && <path className="epigraphic-diamond" d="M0 -16 L5 -11 L0 -6 L-5 -11 Z" />}
        </g>;
      })}

      <text className="region-label" x="487" y="292">TAMIL NADU</text>
      <text className="sea-label" x="812" y="272">BAY OF BENGAL</text>
      <text className="sea-label" x="630" y="532">INDIAN OCEAN</text>
      <g className="north" transform="translate(847 62)">
        <text textAnchor="middle" y="-12">N</text>
        <path d="M0 -2 L5 10 L0 7 L-5 10 Z" />
      </g>
    </svg>
  </div>;
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
