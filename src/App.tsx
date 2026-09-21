import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
  all: {
    title: 'All layers',
    body: 'Tradition, edition metadata, independent evidence and product inference are visible together, but never merged into one claim.',
  },
  edition: {
    title: 'Text / edition',
    body: 'Tēvāram author ↔ patikam ↔ talam links are edition metadata. Luminous route geometry remains product inference.',
  },
  tradition: {
    title: 'Tradition',
    body: 'Traditional saint/place claims are shown as tradition, not as independently verified historical geography.',
  },
  independent: {
    title: 'Independent evidence',
    body: 'Inferred routes are hidden. Only mapped sites with explicit epigraphic evidence are emphasized.',
  },
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
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/data/pramana-export-v1.json')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
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
        .filter(
          (edge) =>
            edge.predicate === 'AUTHOR_OF_TEVARAM_PATIKAM' &&
            edge.subject === selectedSaintId,
        )
        .map((edge) => edge.object),
    );
    return data.patikams.filter((item) => ids.has(item.id));
  }, [data, selectedSaintId]);

  const siteLinks = useMemo(() => {
    const result = new Map<string, string[]>();
    if (!data) return result;
    const authored = new Set(authoredPatikams.map((item) => item.id));
    for (const edge of data.edges) {
      if (
        edge.predicate !== 'TEVARAM_PATIKAM_ASSOCIATED_WITH_SITE' ||
        !authored.has(edge.subject)
      ) {
        continue;
      }
      result.set(edge.object, [...(result.get(edge.object) ?? []), edge.subject]);
    }
    return result;
  }, [data, authoredPatikams]);

  const epigraphicSiteIds = useMemo(
    () =>
      new Set(
        (data?.inscriptions ?? [])
          .map((item) => item.ifp_site_id)
          .filter(Boolean) as string[],
      ),
    [data],
  );

  const routeStops = useMemo(
    () =>
      GEO_SEEDS
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
  const episodeCount =
    data?.edges.filter(
      (edge) =>
        edge.predicate === 'EPISODE_ABOUT_SAINT' &&
        edge.object === selectedSaintId,
    ).length ?? 0;

  const searchResults = useMemo(() => {
    if (!data || !query.trim()) return [];
    const needle = query.trim().toLowerCase();
    return data.sites
      .filter((site) =>
        [site.label, site.label_ta, site.modern_name_nic, ...site.aliases]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle)),
      )
      .slice(0, 6);
  }, [data, query]);

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
    }, 1350);
    return () => window.clearInterval(timer);
  }, [playing, routeStops.length]);

  if (!data) {
    return (
      <div className="loading">
        <div className="loading-mark"><GopuramIcon /></div>
        <div>Opening the Pramāṇa evidence atlas…</div>
      </div>
    );
  }

  const saintName = SAINT_EN[selectedSaintId] ?? saint?.label ?? 'Nayanmar';
  const independentEdges = data.edges.filter(
    (edge) => edge.authority_scope === 'epigraphic_primary',
  ).length;
  const progressPct =
    routeStops.length <= 1 ? 0 : (progress / (routeStops.length - 1)) * 100;
  const activeStop =
    routeStops[Math.min(progress, Math.max(routeStops.length - 1, 0))];

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><GopuramIcon /></span>
          <div>
            <strong>Nayanmar Trails</strong>
            <small>DEVOTION CONNECTS LANDS</small>
          </div>
        </div>

        <nav>
          <button className="active">Explore</button>
          <button onClick={() => document.querySelector('.timeline')?.scrollIntoView({ behavior: 'smooth' })}>Timeline</button>
          <button onClick={() => setTab('visits')}>Temples</button>
          <button onClick={() => setTab('hymns')}>Hymns</button>
          <button onClick={() => setGraphOpen(true)}>Routes</button>
          <button onClick={() => setTab('evidence')}>Stories</button>
        </nav>

        <div className="header-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search temples, saints, or places…"
          />
          {query && (
            <div className="search-results">
              {searchResults.length ? searchResults.map((site) => (
                <button
                  key={site.id}
                  onClick={() => {
                    setSelectedSiteId(site.id);
                    setQuery('');
                    setTab('visits');
                  }}
                >
                  <GopuramIcon />
                  <span>{cleanLabel(site.label)}<small>{site.modern_name_nic || site.district || site.site_id}</small></span>
                </button>
              )) : <em>No matching Pramāṇa talam</em>}
            </div>
          )}
        </div>

        <div className="header-motto">Ancient Paths<br /><b>Living Today</b></div>
      </header>

      <section className="hero">
        <div className="hero-ornament left"><GopuramIcon /></div>
        <div className="hero-copy">
          <span>ANCIENT PATHS · LIVING EVIDENCE</span>
          <h1>Trace the living journeys of the Nayanmars</h1>
          <p>Uncover chronology, temples, hymns and pilgrimage geography across a timeless Tamil land.</p>
        </div>
        <blockquote className="hero-quote">“Not just history,<br />but a living landscape of devotion.”</blockquote>
        <div className="hero-ornament right"><GopuramIcon /></div>
      </section>

      <section className="filters">
        <label>
          <span>Saint</span>
          <select value={selectedSaintId} onChange={(event) => setSelectedSaintId(event.target.value)}>
            {data.saints.map((item) => (
              <option key={item.id} value={item.id}>
                {item.ordinal}. {SAINT_EN[item.id] ?? item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="secondary-filter">
          <span>Century</span>
          <select defaultValue="all"><option value="all">All centuries</option></select>
        </label>
        <label className="secondary-filter">
          <span>Region</span>
          <select defaultValue="tn"><option value="tn">Tamil Nadu</option></select>
        </label>
        <label className="secondary-filter">
          <span>Shrine Type</span>
          <select defaultValue="all"><option value="all">All temples</option></select>
        </label>

        <div className="quick">
          {MUVAR.map((id) => (
            <button
              key={id}
              className={selectedSaintId === id ? 'active' : ''}
              onClick={() => setSelectedSaintId(id)}
            >
              {SAINT_EN[id]?.split(' · ')[0]}
            </button>
          ))}
        </div>

        <div className="mode">
          {(['all', 'edition', 'tradition', 'independent'] as EvidenceMode[]).map((item) => (
            <button
              key={item}
              className={mode === item ? 'active' : ''}
              onClick={() => setMode(item)}
            >
              {item === 'all'
                ? 'All layers'
                : item === 'edition'
                  ? 'Text / edition'
                  : item === 'tradition'
                    ? 'Tradition'
                    : 'Independent'}
            </button>
          ))}
        </div>
      </section>

      <section className="workspace">
        <aside className="panel saint-card">
          <div className="saint-visual">
            <div className="saint-number">{saint?.ordinal}</div>
            <SaintPortrait />
            <div className="temple-silhouette"><GopuramIcon /></div>
          </div>

          <small className="eyebrow">NAYANMAR {saint?.ordinal}</small>
          <h2>{saintName}</h2>
          <div className="tamil">{saint?.label_ta}</div>
          <div className="century-line"><span>◉</span> Traditional registry identity</div>

          <blockquote className="saint-quote">
            “The map is devotional storytelling; the evidence labels say exactly what Pramāṇa can support.”
          </blockquote>

          <div className="stat-grid">
            <Stat value={authoredPatikams.length} label="Tēvāram patikams" />
            <Stat value={siteLinks.size} label="edition-linked talams" />
          </div>

          <div className="major-temples">
            <h3>Mapped exemplars</h3>
            {routeStops.slice(0, 5).map((stop) => (
              <button
                key={stop.siteId}
                onClick={() => {
                  setSelectedSiteId(`tevaram_site.${stop.siteId}`);
                  setTab('visits');
                }}
              >
                <GopuramIcon />
                <span>{stop.name}</span>
                <small>{stop.hymnIds.length}</small>
              </button>
            ))}
          </div>

          <div className="journey-progress">
            <div><b>Journey Progress</b><span>{routeStops.length ? progress + 1 : 0} / {routeStops.length}</span></div>
            <div className="mini-track"><i style={{ width: `${progressPct}%` }} /></div>
          </div>

          <div className="rule">
            <h3>Authority boundary</h3>
            <p>{MODE_COPY[mode].body}</p>
          </div>
        </aside>

        <section className="panel map-card">
          <div className="map-toolbar">
            <span><GopuramIcon /> {MODE_COPY[mode].title}</span>
            <b>{routeStops.length} mapped evidence-linked stops</b>
          </div>

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

          <div className="map-legend">
            <b>Legend</b>
            <span><i className="legend-temple"><GopuramIcon /></i> Pramāṇa talam node</span>
            <span><i className="legend-route" /> Product-inferred playback</span>
            <span><i className="legend-epigraphy" /> Explicit epigraphic evidence</span>
            <small>Terrain, route geometry and modern place centroids are presentation layers, never source evidence.</small>
          </div>

          {graphOpen && (
            <div className="overlay">
              <h3>Saint ↔ Talam Connections</h3>
              <Network saint={saint} stops={routeStops.slice(0, 12)} />
              <p>
                Edges are selected saint → Tēvāram-linked talam relationships.
                Graph layout has no evidentiary meaning.
              </p>
              <button onClick={() => setGraphOpen(false)}>Close graph</button>
            </div>
          )}
        </section>

        <aside className="panel detail-card">
          <div className="tabs">
            {(['hymns', 'chronology', 'visits', 'evidence'] as DetailTab[]).map((item) => (
              <button
                key={item}
                className={tab === item ? 'active' : ''}
                onClick={() => setTab(item)}
              >
                {item === 'visits' ? 'Temple Visits' : item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <div className="detail">
            <div className="temple-visual">
              <div className="temple-art"><GopuramIcon /></div>
              <div className="temple-title">
                <small>CURRENT TALAM</small>
                <h2>{selectedSite ? cleanLabel(selectedSite.label) : 'Select a site'}</h2>
                <p>{selectedSite?.label_ta || selectedSite?.modern_name_nic || ''}</p>
              </div>
            </div>

            {selectedSite && (
              <>
                <div className="chips">
                  <span>{selectedSite.site_id}</span>
                  <span>{selectedSite.patikam_count} total patikams</span>
                  <span>{selectedPatikams.length} by {saintName.split(' · ')[0]}</span>
                </div>

                {tab === 'visits' && (
                  <Visits site={selectedSite} saintName={saintName} count={selectedPatikams.length} />
                )}
                {tab === 'hymns' && (
                  <Hymns ids={selectedPatikams} patikamById={patikamById} />
                )}
                {tab === 'chronology' && <Chronology />}
                {tab === 'evidence' && <Evidence site={selectedSite} data={data} />}

                <div className="temple-facts">
                  <div><GopuramIcon /><span><small>Traditional class</small>{selectedSite.traditional_location_class || 'Not supplied'}</span></div>
                  <div><GopuramIcon /><span><small>Modern catalog</small>{selectedSite.modern_name_nic || selectedSite.district || 'Not supplied'}</span></div>
                  <div><GopuramIcon /><span><small>Patikams</small>{selectedSite.patikam_count}</span></div>
                  <div><GopuramIcon /><span><small>Evidence class</small>{authorityLabel(selectedSite.authority_scope)}</span></div>
                </div>

                <button
                  className="focus"
                  onClick={() =>
                    document.querySelector('.map-card')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                  }
                >
                  View on Map →
                </button>
              </>
            )}
          </div>
        </aside>
      </section>

      <section className="bottom">
        <div className="panel timeline">
          <div className="section-head">
            <div>
              <h3>Timeline of the 63 Nayanmars</h3>
              <p>Playback below is a <b>presentation sequence, not asserted chronology.</b></p>
            </div>
            <Badge kind="inference">INFERENCE</Badge>
          </div>

          <div className="play-row">
            <button
              className="play"
              disabled={routeStops.length < 2}
              onClick={() => {
                if (progress >= routeStops.length - 1) setProgress(0);
                setPlaying((value) => !value);
              }}
            >
              {playing ? 'Ⅱ' : '▶'}
            </button>

            <div className="track">
              <div className="fill" style={{ width: `${progressPct}%` }} />
              {routeStops.map((stop, index) => (
                <button
                  key={stop.siteId}
                  title={stop.name}
                  className={`stop ${index <= progress ? 'reached' : ''}`}
                  style={{
                    left: `${routeStops.length <= 1 ? 0 : (index / (routeStops.length - 1)) * 100}%`,
                  }}
                  onClick={() => {
                    setProgress(index);
                    setSelectedSiteId(`tevaram_site.${stop.siteId}`);
                  }}
                />
              ))}
            </div>

            <div className="now">
              {activeStop ? (
                <>
                  <b>{activeStop.name}</b>
                  <small>{activeStop.hymnIds.length} linked patikam{activeStop.hymnIds.length === 1 ? '' : 's'}</small>
                </>
              ) : (
                <>
                  <b>No mapped playback</b>
                  <small>No current seed stops for this saint.</small>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="panel graph-mini">
          <h3>Saint – Temple Connections</h3>
          <Network saint={saint} stops={routeStops.slice(0, 8)} />
        </div>

        <div className="panel density-card">
          <h3>Temple Visit Density</h3>
          <MiniDensity stops={routeStops} />
        </div>

        <div className="panel totals">
          <Stat value={data.meta.counts.tevaram_sites} label="Total Temples" />
          <Stat value={data.meta.counts.tevaram_patikams} label="Total Patikams" />
          <Stat value={data.meta.counts.saints} label="Nayanmars" />
          <Stat value={independentEdges} label="Independent edges" />
        </div>
      </section>

      <footer>
        <strong><GopuramIcon /> Nayanmar Trails</strong>
        <span>A digital humanities initiative for a more connected sacred history.</span>
        <span>Pramāṇa source {data.meta.source_commit.slice(0, 10)}</span>
      </footer>
    </main>
  );
}


function SaintPortrait() {
  return (
    <svg className="saint-portrait" viewBox="0 0 220 230" aria-hidden="true">
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d6a06d" />
          <stop offset=".55" stopColor="#a9653f" />
          <stop offset="1" stopColor="#6e3f2f" />
        </linearGradient>
        <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d99542" />
          <stop offset="1" stopColor="#8d4e2a" />
        </linearGradient>
        <filter id="portraitGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="108" cy="101" r="78" fill="#183d3d" opacity=".78" />
      <path d="M58 196 C66 154 77 145 90 139 C97 136 103 132 105 127 C86 117 77 97 79 73 C81 49 96 34 115 32 C138 29 156 44 160 68 C164 90 156 113 139 126 C141 133 148 138 157 142 C172 150 184 166 191 199 Z" fill="url(#skin)" />
      <path d="M75 60 C80 31 103 17 128 22 C151 27 161 46 158 69 C148 57 137 51 123 50 C104 49 91 55 75 60 Z" fill="#191b18" />
      <path d="M112 20 C110 6 117 0 127 2 C140 4 145 13 140 28" fill="#151714" />
      <path d="M145 72 C157 83 158 104 149 119 C142 132 131 138 119 139 C137 127 144 110 143 94 Z" fill="#2a211b" />
      <path d="M89 86 Q105 75 121 84" stroke="#402a21" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M126 84 Q141 76 151 86" stroke="#402a21" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="104" cy="88" r="3.5" fill="#17120f" />
      <circle cx="138" cy="88" r="3.5" fill="#17120f" />
      <path d="M122 88 C120 101 117 109 119 113" stroke="#7c4934" strokeWidth="3" fill="none" />
      <path d="M105 119 Q122 128 138 118" stroke="#563126" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M83 69 H151" stroke="#f2e4cf" strokeWidth="5" opacity=".95" />
      <path d="M87 76 H148" stroke="#f2e4cf" strokeWidth="4" opacity=".93" />
      <path d="M91 83 H145" stroke="#f2e4cf" strokeWidth="3" opacity=".9" />
      <circle cx="119" cy="77" r="4" fill="#b53a2b" />
      <path d="M63 195 C75 161 86 150 99 145 L120 173 L143 145 C160 153 174 168 185 196 Z" fill="url(#cloth)" />
      <path d="M95 142 C101 159 109 174 120 184 C130 174 139 159 146 143" fill="none" stroke="#e8c78a" strokeWidth="4" />
      <g fill="#3b2117">
        <circle cx="101" cy="151" r="3" /><circle cx="108" cy="157" r="3" /><circle cx="115" cy="163" r="3" />
        <circle cx="122" cy="164" r="3" /><circle cx="129" cy="159" r="3" /><circle cx="136" cy="152" r="3" />
      </g>
      <circle cx="110" cy="107" r="91" fill="none" stroke="#d8a651" strokeWidth="2" opacity=".55" filter="url(#portraitGlow)" />
    </svg>
  );
}

function GopuramIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`gopuram-icon ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M28 4h8l2 6H26l2-6Z" />
      <path d="M23 12h18l3 7H20l3-7Z" />
      <path d="M18 21h28l3 8H15l3-8Z" />
      <path d="M13 31h38l3 10H10l3-10Z" />
      <path d="M8 43h48v9H8z" />
      <path d="M5 54h54v6H5z" />
      <path d="M25 39h14v21H25z" className="door" />
      <circle cx="25" cy="16" r="1.5" />
      <circle cx="32" cy="16" r="1.5" />
      <circle cx="39" cy="16" r="1.5" />
      <circle cx="21" cy="26" r="1.5" />
      <circle cx="28" cy="26" r="1.5" />
      <circle cx="36" cy="26" r="1.5" />
      <circle cx="43" cy="26" r="1.5" />
    </svg>
  );
}

function MapGopuram({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x - 7 * scale} ${y - 12 * scale}) scale(${0.22 * scale})`}>
      <path d="M28 4h8l2 6H26l2-6Z" />
      <path d="M23 12h18l3 7H20l3-7Z" />
      <path d="M18 21h28l3 8H15l3-8Z" />
      <path d="M13 31h38l3 10H10l3-10Z" />
      <path d="M8 43h48v9H8z" />
      <path d="M5 54h54v6H5z" />
      <path className="map-door" d="M25 39h14v21H25z" />
    </g>
  );
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
    const x = 55 + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - 110);
    const y = 36 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (height - 72);
    return [x, y] as const;
  };

  const landPoints = TAMIL_NADU_SCHEMATIC
    .map(([lng, lat]) => project(lng, lat).join(','))
    .join(' ');

  const fullRoute = routeStops.map((stop) => project(stop.lng, stop.lat));
  const activeRoute = routeStops
    .slice(0, Math.min(progress + 1, routeStops.length))
    .map((stop) => project(stop.lng, stop.lat));

  const pathFor = (points: readonly (readonly [number, number])[]) =>
    points.length < 2
      ? ''
      : points
          .map(([x, y], index) => `${index ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(' ');

  const isEditionVisible = mode === 'all' || mode === 'edition';
  const isSiteVisible = mode !== 'tradition';
  const currentPoint = activeRoute[activeRoute.length - 1];

  return (
    <div className="map sacred-map" aria-label="Evidence-aware Tamil Nadu sacred geography">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img">
        <defs>
          <linearGradient id="landGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#55745b" />
            <stop offset=".24" stopColor="#355d4e" />
            <stop offset=".58" stopColor="#1e4b43" />
            <stop offset="1" stopColor="#0c2d34" />
          </linearGradient>
          <radialGradient id="mapGlow" cx="52%" cy="43%" r="66%">
            <stop offset="0" stopColor="#47735e" stopOpacity=".42" />
            <stop offset=".55" stopColor="#123d42" stopOpacity=".18" />
            <stop offset="1" stopColor="#051923" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cityGlow">
            <stop offset="0" stopColor="#ffe19a" stopOpacity=".95" />
            <stop offset=".22" stopColor="#f5b74e" stopOpacity=".55" />
            <stop offset="1" stopColor="#f5b74e" stopOpacity="0" />
          </radialGradient>
          <pattern id="contours" width="48" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M-8 22 C7 4 22 36 52 11"
              fill="none"
              stroke="#a8c68f"
              strokeOpacity=".08"
              strokeWidth="1"
            />
          </pattern>
          <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="templeGlow" x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="landClip">
            <polygon points={landPoints} />
          </clipPath>
        </defs>

        <rect width={width} height={height} fill="#061a24" />
        <rect width={width} height={height} fill="url(#mapGlow)" />

        <g className="sea-texture" opacity=".32">
          <path d="M665 30 C743 84 796 170 804 257 C813 357 775 432 700 535" />
          <path d="M725 23 C802 95 843 180 848 273 C852 367 820 449 758 538" />
          <path d="M54 151 C103 178 121 221 106 276 C91 331 90 401 129 470" />
        </g>

        <polygon
          points={landPoints}
          fill="url(#landGradient)"
          stroke="#e1bd6f"
          strokeOpacity=".72"
          strokeWidth="2"
        />
        <polygon points={landPoints} fill="url(#contours)" />

        <g clipPath="url(#landClip)" className="relief">
          <ellipse cx="208" cy="183" rx="130" ry="70" />
          <ellipse cx="246" cy="290" rx="118" ry="116" />
          <ellipse cx="342" cy="430" rx="110" ry="80" />
          <ellipse cx="515" cy="225" rx="115" ry="70" />
          <ellipse cx="590" cy="350" rx="132" ry="92" />
        </g>

        <g className="mountains">
          <path d="M153 147 L182 104 L204 144 L230 115 L259 163 L286 129 L319 178" />
          <path d="M203 225 L238 176 L261 214 L296 164 L334 230" />
          <path d="M252 354 L292 300 L325 344 L358 293 L399 364" />
        </g>

        <g className="rivers">
          <path d="M245 315 C326 294 386 320 461 347 C533 373 598 365 704 337" />
          <path d="M408 219 C466 237 522 254 596 245" />
          <path d="M353 437 C427 405 490 424 562 458" />
        </g>

        <g className="region-boundaries">
          <path d="M215 173 C307 194 341 266 320 340" />
          <path d="M410 133 C437 220 446 321 421 430" />
          <path d="M559 155 C544 230 567 303 639 365" />
        </g>

        {isEditionVisible && fullRoute.length > 1 && (
          <>
            <path className="route route-ghost" d={pathFor(fullRoute)} />
            <path className="route route-dots" d={pathFor(fullRoute)} />
            {activeRoute.length > 1 && (
              <path
                className="route route-live"
                d={pathFor(activeRoute)}
                filter="url(#routeGlow)"
              />
            )}
          </>
        )}

        {isSiteVisible &&
          GEO_SEEDS.map((seed) => {
            const [x, y] = project(seed.lng, seed.lat);
            const siteId = `tevaram_site.${seed.siteId}`;
            const linked = siteLinks.get(siteId)?.length ?? 0;
            const independent = epigraphicSiteIds.has(seed.siteId);
            if (mode === 'independent' && !independent) return null;
            const selected = selectedSiteId === siteId;
            const active = linked > 0;

            return (
              <g
                key={seed.siteId}
                className={`temple-marker ${active ? 'linked' : ''} ${independent ? 'independent' : ''} ${selected ? 'selected' : ''}`}
                transform={`translate(${x} ${y})`}
                onClick={() => onSelect(siteId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') onSelect(siteId);
                }}
                role="button"
                tabIndex={0}
                aria-label={`${seed.name}, ${linked} linked patikams`}
              >
                <circle className="marker-glow" r={selected ? 25 : active ? 18 : 12} />
                <circle className="marker-ring" r={selected ? 12 : active ? 10 : 8} />
                <MapGopuram x={0} y={0} scale={selected ? 1.1 : active ? 1 : .82} />
                {(active || selected) && (
                  <text y={selected ? 30 : 26} textAnchor="middle">{seed.name}</text>
                )}
                {independent && (
                  <path className="epigraphic-diamond" d="M0 -20 L5 -15 L0 -10 L-5 -15 Z" />
                )}
              </g>
            );
          })}

        {currentPoint && isEditionVisible && (
          <g className="traveler" transform={`translate(${currentPoint[0]} ${currentPoint[1]})`}>
            <circle r="22" fill="url(#cityGlow)" />
            <circle r="5" />
          </g>
        )}

        <text className="region-label" x="455" y="303">TAMIL NADU</text>
        <text className="sea-label" x="794" y="276">BAY OF BENGAL</text>
        <text className="sea-label" x="636" y="531">INDIAN OCEAN</text>
        <text className="neighbor-label" x="183" y="92">KARNATAKA</text>
        <text className="neighbor-label" x="119" y="334">KERALA</text>

        <g className="north" transform="translate(846 65)">
          <text textAnchor="middle" y="-14">N</text>
          <path d="M0 -3 L6 12 L0 8 L-6 12 Z" />
          <path d="M0 28 L-5 16 L0 20 L5 16 Z" opacity=".5" />
        </g>
      </svg>

      {mode === 'tradition' && (
        <div className="map-message">
          <Badge kind="tradition">TRADITION LAYER</Badge>
          <p>Traditional place assertions are kept separate. This v1 map does not yet geocode the full traditional-place registry.</p>
        </div>
      )}
    </div>
  );
}

function Badge({
  kind,
  children,
}: {
  kind: 'tradition' | 'edition' | 'independent' | 'inference';
  children: ReactNode;
}) {
  return <span className={`badge ${kind}`}>{children}</span>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <small>{label}</small>
    </div>
  );
}

function Visits({
  site,
  saintName,
  count,
}: {
  site: Site;
  saintName: string;
  count: number;
}) {
  return (
    <div className="text">
      <Badge kind="edition">EDITION METADATA</Badge>
      <p>
        <b>{saintName}</b> is linked to {count} Tēvāram patikam
        {count === 1 ? '' : 's'} associated with this traditional talam in the current Pramāṇa graph.
      </p>
      <p className="quote-box">This is a Tēvāram association, not by itself proof of the exact modern temple or road travelled.</p>
    </div>
  );
}

function Hymns({
  ids,
  patikamById,
}: {
  ids: string[];
  patikamById: Map<string, { tirumurai: number; patikam: number }>;
}) {
  return (
    <div className="text">
      <Badge kind="edition">TĒVĀRAM LOCI</Badge>
      {ids.length ? (
        <ul className="hymns">
          {ids.slice(0, 8).map((id) => {
            const item = patikamById.get(id);
            return (
              <li key={id}>
                <span><GopuramIcon /></span>
                <div>
                  <b>{id.replace('tevaram.ifp.', 'Tēvāram ')}</b>
                  <small>
                    {item
                      ? `Tirumurai ${item.tirumurai} · Patikam ${item.patikam}`
                      : 'Edition locus'}
                  </small>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No patikam by the selected saint is linked to this mapped talam.</p>
      )}
    </div>
  );
}

function Chronology() {
  return (
    <div className="text">
      <Badge kind="inference">FAIL-CLOSED CHRONOLOGY</Badge>
      <p>
        The current Pramāṇa Nayanmar graph does <b>not</b> assert a complete historical visit sequence or precise saint chronology.
      </p>
      <p className="quote-box">
        Nayanmar Trails therefore keeps playback as presentation inference until a versioned chronology export exists.
      </p>
    </div>
  );
}

function Evidence({ site, data }: { site: Site; data: PramanaExport }) {
  const inscriptions = data.inscriptions.filter(
    (item) => item.ifp_site_id === site.site_id,
  );

  return (
    <div className="text">
      <Badge kind="edition">{authorityLabel(site.authority_scope).toUpperCase()}</Badge>
      <p>
        This talam node is presented as <b>{authorityLabel(site.authority_scope)}</b>.
      </p>
      {inscriptions.length ? (
        inscriptions.map((item) => (
          <div className="inscription" key={item.id}>
            <Badge kind="independent">INDEPENDENT PRIMARY EVIDENCE</Badge>
            <b>{item.label}</b>
            <p>{item.historical_scope}</p>
          </div>
        ))
      ) : (
        <p className="caution">
          No explicit epigraphic edge is attached to this mapped talam in the current export. That is not evidence of historical absence.
        </p>
      )}
    </div>
  );
}

function Network({
  saint,
  stops,
}: {
  saint: Saint | null;
  stops: Array<{ siteId: string; name: string; hymnIds: string[] }>;
}) {
  const width = 320;
  const height = 130;
  const cx = 160;
  const cy = 64;
  const rx = 118;
  const ry = 44;

  return (
    <svg className="network" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Saint to talam graph">
      {stops.map((stop, index) => {
        const angle = (index / Math.max(stops.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * rx;
        const y = cy + Math.sin(angle) * ry;
        return (
          <g key={stop.siteId}>
            <line x1={cx} y1={cy} x2={x} y2={y} />
            <circle cx={x} cy={y} r={4 + Math.min(stop.hymnIds.length / 3, 4)} />
            <text x={x} y={y + 14} textAnchor="middle">{stop.name.slice(0, 11)}</text>
          </g>
        );
      })}
      <circle className="center" cx={cx} cy={cy} r="14" />
      <text className="center-text" x={cx} y={cy + 3} textAnchor="middle">
        {saint?.ordinal ?? '—'}
      </text>
    </svg>
  );
}

function MiniDensity({ stops }: { stops: SacredStop[] }) {
  const spots = stops.slice(0, 10);
  return (
    <div className="density-map">
      <svg viewBox="0 0 180 110" role="img" aria-label="Temple density preview">
        <path
          d="M112 7 L136 19 L146 41 L145 63 L133 87 L115 103 L94 99 L82 82 L67 69 L58 47 L65 28 L84 15 Z"
          className="density-land"
        />
        {spots.map((stop, index) => {
          const x = 78 + ((stop.lng - 77.2) / 3.2) * 60;
          const y = 20 + ((13.3 - stop.lat) / 4.3) * 70;
          return <circle key={stop.siteId} cx={x} cy={y} r={5 + Math.min(stop.hymnIds.length, 5)} className={`heat heat-${index % 3}`} />;
        })}
      </svg>
      <div className="density-scale"><span>Low</span><i /><span>High</span></div>
    </div>
  );
}
