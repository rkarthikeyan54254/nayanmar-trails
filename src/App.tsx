import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { GEO_SEEDS } from './geometry';
import { DISTRICT_CENTROIDS, normalizeDistrict } from './coverage';
import { SAINT_MEDIA, TEMPLE_MEDIA } from './media';
import GopuramIcon from './GopuramIcon';
import SacredMap, { type CoveragePoint, type EvidenceMode, type MapStop } from './SacredMap';
import type { PramanaExport, Saint, Site } from './types';

type DetailTab = 'hymns' | 'chronology' | 'visits' | 'evidence';

const MUVAR = ['nayanmar.20', 'nayanmar.27', 'nayanmar.63'];

const SAINT_EN: Record<string, string> = {
  'nayanmar.20': 'Appar · Tirunavukkarasar',
  'nayanmar.27': 'Sambandar',
  'nayanmar.63': 'Sundarar · Arurar',
};

const MODE_COPY: Record<EvidenceMode, { label: string; short: string; body: string }> = {
  all: {
    label: 'All layers',
    short: 'Layered view',
    body: 'Tradition, edition metadata, independent evidence and product inference are visible together, but never collapsed into one claim.',
  },
  edition: {
    label: 'Text / edition',
    short: 'Tēvāram evidence',
    body: 'Author ↔ patikam ↔ talam links come from the edition-aligned Tēvāram graph. Route geometry remains product inference.',
  },
  tradition: {
    label: 'Tradition',
    short: 'Traditional associations',
    body: 'Traditional saint and place assertions remain visibly distinct from historical verification.',
  },
  independent: {
    label: 'Independent',
    short: 'Independent evidence',
    body: 'Inferred routes are hidden. Only mapped sites with explicit epigraphic support are emphasized.',
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

  const routeStops = useMemo<MapStop[]>(
    () =>
      GEO_SEEDS
        .map((seed) => ({
          ...seed,
          hymnIds: siteLinks.get(`tevaram_site.${seed.siteId}`) ?? [],
        }))
        .filter((item) => item.hymnIds.length)
        .sort((a, b) => a.playbackRank - b.playbackRank),
    [siteLinks],
  );

  const districtCoverage = useMemo<CoveragePoint[]>(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const site of data.sites) {
      const key = normalizeDistrict(site.district);
      if (key === 'unknown') continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return DISTRICT_CENTROIDS
      .map((district) => ({
        ...district,
        count: counts.get(district.key) ?? 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const topLinkedSites = useMemo(() => {
    return [...siteLinks.entries()]
      .map(([siteId, patikams]) => ({
        site: siteById.get(siteId),
        count: patikams.length,
      }))
      .filter((item): item is { site: Site; count: number } => Boolean(item.site))
      .sort((a, b) => b.count - a.count || b.site.patikam_count - a.site.patikam_count)
      .slice(0, 6);
  }, [siteById, siteLinks]);

  const selectedSite = siteById.get(selectedSiteId) ?? null;
  const selectedPatikams = siteLinks.get(selectedSiteId) ?? [];

  const episodeCount =
    data?.edges.filter(
      (edge) =>
        edge.predicate === 'EPISODE_ABOUT_SAINT' &&
        edge.object === selectedSaintId,
    ).length ?? 0;

  const independentEdges =
    data?.edges.filter((edge) => edge.authority_scope === 'epigraphic_primary').length ?? 0;

  const searchResults = useMemo(() => {
    if (!data || !query.trim()) return { saints: [] as Saint[], sites: [] as Site[] };
    const needle = query.trim().toLowerCase();

    const saints = data.saints
      .filter((item) =>
        [item.label, item.label_ta, ...(item.aliases ?? [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle)),
      )
      .slice(0, 3);

    const sites = data.sites
      .filter((item) =>
        [item.label, item.label_ta, item.modern_name_nic, item.district, ...(item.aliases ?? [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle)),
      )
      .slice(0, 5);

    return { saints, sites };
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
    }, 1500);
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
  const activeStop = routeStops[Math.min(progress, Math.max(0, routeStops.length - 1))];
  const progressPct =
    routeStops.length <= 1 ? 0 : (progress / (routeStops.length - 1)) * 100;
  const saintMedia = SAINT_MEDIA[selectedSaintId];
  const templeMedia = selectedSite ? TEMPLE_MEDIA[selectedSite.id] : undefined;

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
          <span className="search-glyph">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saints, temples, or places…"
          />
          {query && (
            <div className="search-results">
              {searchResults.saints.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedSaintId(item.id);
                    setQuery('');
                  }}
                >
                  <GopuramIcon />
                  <span>
                    {SAINT_EN[item.id] ?? item.label}
                    <small>Nayanmar {item.ordinal}</small>
                  </span>
                </button>
              ))}
              {searchResults.sites.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedSiteId(item.id);
                    setTab('visits');
                    setQuery('');
                  }}
                >
                  <GopuramIcon />
                  <span>
                    {cleanLabel(item.label)}
                    <small>{item.modern_name_nic || item.district || item.site_id}</small>
                  </span>
                </button>
              ))}
              {!searchResults.saints.length && !searchResults.sites.length && (
                <em>No matching Pramāṇa entity</em>
              )}
            </div>
          )}
        </div>

        <div className="header-motto">
          Ancient Paths<br /><b>Living Today</b>
        </div>
      </header>

      <section className="hero">
        <div className="hero-mountain hero-mountain-a" />
        <div className="hero-mountain hero-mountain-b" />
        <div className="hero-lamp">✦</div>
        <div className="hero-tower left"><GopuramIcon /></div>
        <div className="hero-copy">
          <span>ANCIENT PATHS · LIVING EVIDENCE</span>
          <h1>Trace the living journeys of the Nayanmars</h1>
          <p>Temples, hymns, sacred geography and evidence — read together without blurring what each source can actually support.</p>
        </div>
        <blockquote className="hero-quote">
          “Not just history,<br />but a living landscape of devotion.”
        </blockquote>
        <div className="hero-tower right"><GopuramIcon /></div>
      </section>

      <section className="filters">
        <Filter label="Saint">
          <select value={selectedSaintId} onChange={(event) => setSelectedSaintId(event.target.value)}>
            {data.saints.map((item) => (
              <option key={item.id} value={item.id}>
                {item.ordinal}. {SAINT_EN[item.id] ?? item.label}
              </option>
            ))}
          </select>
        </Filter>

        <Filter label="Century">
          <select defaultValue="unasserted">
            <option value="unasserted">Not asserted in v1</option>
          </select>
        </Filter>

        <Filter label="Region">
          <select defaultValue="tn">
            <option value="tn">Tamil Nadu</option>
          </select>
        </Filter>

        <Filter label="Evidence lens">
          <select value={mode} onChange={(event) => setMode(event.target.value as EvidenceMode)}>
            {(Object.keys(MODE_COPY) as EvidenceMode[]).map((item) => (
              <option key={item} value={item}>{MODE_COPY[item].label}</option>
            ))}
          </select>
        </Filter>

        <div className="mode-pills">
          {(Object.keys(MODE_COPY) as EvidenceMode[]).map((item) => (
            <button
              key={item}
              className={mode === item ? 'active' : ''}
              onClick={() => setMode(item)}
            >
              {MODE_COPY[item].label}
            </button>
          ))}
        </div>
      </section>

      <section className="workspace">
        <aside className="panel saint-card">
          <div className="saint-visual">
            {saintMedia ? (
              <img
                src={saintMedia.src}
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="saint-fallback"><GopuramIcon /></div>
            )}
            <div className="saint-gradient" />
            <div className="saint-number">{saint?.ordinal}</div>
            <div className="saint-temple"><GopuramIcon /></div>
            {saintMedia && (
              <small className="media-credit">
                {saintMedia.source} · {saintMedia.license}
              </small>
            )}
          </div>

          <div className="saint-heading">
            <small>NAYANMAR {saint?.ordinal}</small>
            <h2>{saintName}</h2>
            <div className="tamil">{saint?.label_ta}</div>
          </div>

          <div className="identity-line"><GopuramIcon /> Traditional identity</div>

          <blockquote className="saint-quote">
            The devotional story remains vivid; the evidence layer remains explicit.
          </blockquote>

          <div className="stat-grid">
            <Stat value={authoredPatikams.length} label="Tēvāram patikams" />
            <Stat value={siteLinks.size} label="linked talams" />
            <Stat value={episodeCount} label="Periya Puranam links" />
            <Stat value={routeStops.length} label="exact mapped exemplars" />
          </div>

          <div className="major-temples">
            <div className="section-title">
              <h3>Major linked talams</h3>
              <span>{siteLinks.size} total</span>
            </div>
            {topLinkedSites.map(({ site, count }) => (
              <button
                key={site.id}
                onClick={() => {
                  setSelectedSiteId(site.id);
                  setTab('visits');
                }}
              >
                <GopuramIcon />
                <span>{cleanLabel(site.label)}</span>
                <small>{count}</small>
              </button>
            ))}
          </div>

          <div className="journey-progress">
            <div>
              <b>Playback progress</b>
              <span>{routeStops.length ? Math.min(progress + 1, routeStops.length) : 0} / {routeStops.length}</span>
            </div>
            <div className="mini-track"><i style={{ width: `${progressPct}%` }} /></div>
          </div>

          <div className="authority-box">
            <b>{MODE_COPY[mode].short}</b>
            <p>{MODE_COPY[mode].body}</p>
          </div>
        </aside>

        <section className="panel map-card">
          <div className="map-toolbar">
            <div className="map-toolbar-left">
              <GopuramIcon />
              <span>{MODE_COPY[mode].short}</span>
            </div>
            <div className="map-toolbar-stats">
              <span><b>{data.meta.counts.tevaram_sites}</b> talam nodes</span>
              <span><b>{districtCoverage.length}</b> mapped districts</span>
              <span><b>{routeStops.length}</b> exact exemplars</span>
            </div>
          </div>

          <SacredMap
            routeStops={routeStops}
            coverage={districtCoverage}
            selectedSiteId={selectedSiteId}
            mode={mode}
            progress={progress}
            epigraphicSiteIds={epigraphicSiteIds}
            onSelect={(siteId) => {
              setSelectedSiteId(siteId);
              setTab('visits');
            }}
          />

          <div className="map-legend">
            <b>Evidence legend</b>
            <span><i className="legend-tower"><GopuramIcon /></i> exact modern centroid for a mapped exemplar</span>
            <span><i className="legend-route" /> route between known endpoints — product inference</span>
            <span><i className="legend-coverage" /> corpus density by normalized modern district</span>
            <span><i className="legend-independent" /> explicit independent epigraphic support</span>
          </div>

          <div className="map-source-note">
            OpenFreeMap / OpenStreetMap basemap · Pramāṇa data overlay
          </div>

          {graphOpen && (
            <div className="overlay">
              <div className="overlay-head">
                <div>
                  <small>SELECTED SAINT</small>
                  <h3>Saint ↔ Talam Connections</h3>
                </div>
                <button onClick={() => setGraphOpen(false)}>Close</button>
              </div>
              <Network
                saint={saint}
                sites={topLinkedSites.slice(0, 12)}
              />
              <p>
                Edges are Tēvāram author → patikam → talam relationships from the versioned Pramāṇa export.
                Layout position has no evidentiary meaning.
              </p>
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
            <div className={`temple-visual ${templeMedia ? 'has-photo' : ''}`}>
              {templeMedia ? (
                <img src={templeMedia.src} alt="" />
              ) : (
                <div className="temple-art"><GopuramIcon /></div>
              )}
              <div className="temple-shade" />
              <div className="temple-title">
                <small>CURRENT TALAM</small>
                <h2>{selectedSite ? cleanLabel(selectedSite.label) : 'Select a talam'}</h2>
                <p>{selectedSite?.label_ta || selectedSite?.modern_name_nic || ''}</p>
              </div>
              {templeMedia && (
                <span className="temple-credit">{templeMedia.source} · {templeMedia.license}</span>
              )}
            </div>

            {selectedSite && (
              <>
                <div className="chips">
                  <span>{selectedSite.site_id}</span>
                  <span>{selectedSite.patikam_count} site patikams</span>
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
                  <Fact label="Traditional class" value={selectedSite.traditional_location_class || 'Not supplied'} />
                  <Fact label="Modern catalog" value={selectedSite.modern_name_nic || selectedSite.district || 'Not supplied'} />
                  <Fact label="District" value={selectedSite.district || 'Not supplied'} />
                  <Fact label="Evidence class" value={authorityLabel(selectedSite.authority_scope)} />
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
                  <GopuramIcon /> View on map →
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
              <h3>Journey Playback</h3>
              <p>Geographic presentation sequence — <b>not a historical chronology.</b></p>
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
                  <b>No exact mapped playback</b>
                  <small>This saint has no current exact seed stops.</small>
                </>
              )}
            </div>
          </div>

          <div className="timeline-labels">
            {routeStops.slice(0, 6).map((stop) => <span key={stop.siteId}>{stop.name}</span>)}
          </div>
        </div>

        <div className="panel graph-mini">
          <div className="section-title">
            <h3>Saint – Talam Graph</h3>
            <span>{siteLinks.size} linked talams</span>
          </div>
          <Network saint={saint} sites={topLinkedSites.slice(0, 8)} />
        </div>

        <div className="panel density-card">
          <div className="section-title">
            <h3>Corpus Density</h3>
            <span>by catalog district</span>
          </div>
          <DensityPanel points={districtCoverage.slice(0, 6)} />
        </div>

        <div className="panel totals">
          <Stat value={data.meta.counts.saints} label="Nayanmars" />
          <Stat value={data.meta.counts.tevaram_sites} label="Tēvāram talams" />
          <Stat value={data.meta.counts.tevaram_patikams} label="Patikams" />
          <Stat value={data.meta.counts.total_edges} label="Typed edges" />
        </div>
      </section>

      <footer>
        <strong><GopuramIcon /> Nayanmar Trails</strong>
        <span>Versioned read-only Pramāṇa export · source commit {data.meta.source_commit.slice(0, 10)}</span>
        <span>Map © OpenFreeMap / OpenMapTiles / OpenStreetMap</span>
      </footer>
    </main>
  );
}

function Filter({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="filter">
      <span>{label}</span>
      {children}
    </label>
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
      <b>{value.toLocaleString()}</b>
      <small>{label}</small>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="fact">
      <GopuramIcon />
      <span>
        <small>{label}</small>
        {value}
      </span>
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
        <b>{saintName}</b> is linked to <b>{count}</b> Tēvāram patikam
        {count === 1 ? '' : 's'} associated with this traditional talam in the current Pramāṇa graph.
      </p>
      <div className="evidence-callout">
        <GopuramIcon />
        <p>
          This establishes a text/edition association. It does not by itself prove the precise modern temple identity or historical road travelled.
        </p>
      </div>
      {site.temple_identification_status && (
        <p className="microcopy">Temple identification status: {site.temple_identification_status}</p>
      )}
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
                <GopuramIcon />
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
        <p>No patikam by the selected saint is linked to this talam.</p>
      )}
    </div>
  );
}

function Chronology() {
  return (
    <div className="text">
      <Badge kind="inference">FAIL-CLOSED CHRONOLOGY</Badge>
      <p>
        The current Pramāṇa Nayanmar graph does <b>not</b> assert a complete visit sequence or a precise historical chronology.
      </p>
      <div className="evidence-callout">
        <GopuramIcon />
        <p>
          Playback therefore remains explicitly labeled product inference until a versioned chronology export exists.
        </p>
      </div>
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
        <div className="evidence-callout muted">
          <GopuramIcon />
          <p>
            No explicit epigraphic edge is attached to this mapped talam in the current export. That is not evidence of historical absence.
          </p>
        </div>
      )}
    </div>
  );
}

function Network({
  saint,
  sites,
}: {
  saint: Saint | null;
  sites: Array<{ site: Site; count: number }>;
}) {
  const width = 360;
  const height = 148;
  const cx = 180;
  const cy = 73;
  const rx = 137;
  const ry = 52;

  return (
    <svg className="network" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Saint to talam graph">
      {sites.map(({ site, count }, index) => {
        const angle = (index / Math.max(sites.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * rx;
        const y = cy + Math.sin(angle) * ry;
        return (
          <g key={site.id}>
            <line x1={cx} y1={cy} x2={x} y2={y} />
            <circle cx={x} cy={y} r={4 + Math.min(count, 7) * .8} />
            <text x={x} y={y + 16} textAnchor="middle">{cleanLabel(site.label).slice(0, 13)}</text>
          </g>
        );
      })}
      <circle className="center" cx={cx} cy={cy} r="16" />
      <text className="center-text" x={cx} y={cy + 3} textAnchor="middle">
        {saint?.ordinal ?? '—'}
      </text>
    </svg>
  );
}

function DensityPanel({ points }: { points: CoveragePoint[] }) {
  const max = Math.max(...points.map((item) => item.count), 1);
  return (
    <div className="density-list">
      {points.map((point) => (
        <div className="density-row" key={point.key}>
          <span>{point.label}</span>
          <div><i style={{ width: `${Math.max(8, (point.count / max) * 100)}%` }} /></div>
          <b>{point.count}</b>
        </div>
      ))}
      <small>Counts come from the 276-site Pramāṇa catalog after district-name normalization.</small>
    </div>
  );
}
