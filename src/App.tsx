import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { GEO_SEEDS, TAMIL_NADU_SCHEMATIC } from './geometry';
import { DISTRICT_CENTROIDS, normalizeDistrict } from './coverage';
import { HERO_MEDIA, SAINT_MEDIA, TEMPLE_MEDIA } from './media';
import GopuramIcon from './GopuramIcon';
import SacredMap, { type CoveragePoint, type EvidenceMode, type MapStop } from './SacredMap';
import type { PramanaExport, Saint, Site } from './types';

type DetailTab = 'hymns' | 'chronology' | 'visits' | 'evidence';

const MANIKKAVASAKAR_ID = 'tirumurai8.manikkavacakar';
const MUVAR = ['nayanmar.20', 'nayanmar.27', 'nayanmar.63'];
const NAALVAR = [...MUVAR, MANIKKAVASAKAR_ID];

type Tirumurai8Locus = {
  id: string;
  site_id: string;
  site_entity_id: string;
  display_name: string;
  label_ta: string;
  section_numbers: number[];
  section_titles_ta: string[];
  locus_basis: string;
  authority_scope: string;
  playback_rank: number;
};

type Tirumurai8Snapshot = {
  meta: {
    source_commit: string;
    release_id: string;
    beta_ready: boolean;
    playback_policy: string;
  };
  author: {
    id: string;
    label: string;
    display_label: string;
    label_ta: string;
    group: string;
    registry_note: string;
  };
  works: {
    tiruvacakam: { sections: number; source_units: number };
    tirukkovaiyar: { source_order_units: number };
  };
  authority: {
    text: string;
    historical: string;
    independent_textual_verification: string;
  };
  loci: Tirumurai8Locus[];
};

type PlaybackStop = {
  id: string;
  name: string;
  detail: string;
  kind: 'exact_text_locus' | 'traditional_place';
  siteId?: string;
};

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

function modernShort(value: string | null | undefined) {
  if (!value) return '';
  let current = value.trim().replace(/^\([^)]*\)\s*/, '');
  if (current.includes('[[')) current = current.split('[[')[0].trim();
  const beforeParen = current.split('(')[0].trim();
  return beforeParen || current;
}

function siteDisplayName(site: Site) {
  return modernShort(site.modern_name_nic) || cleanLabel(site.label);
}

export default function App() {
  const [data, setData] = useState<PramanaExport | null>(null);
  const [tirumurai8, setTirumurai8] = useState<Tirumurai8Snapshot | null>(null);
  const [selectedSaintId, setSelectedSaintId] = useState(
    () => new URLSearchParams(window.location.search).get('saint') || 'nayanmar.20',
  );
  const [selectedSiteId, setSelectedSiteId] = useState('tevaram_site.KV01');
  const [mode, setMode] = useState<EvidenceMode>('all');
  const [tab, setTab] = useState<DetailTab>('visits');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [graphOpen, setGraphOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/data/pramana-export-v1.json').then((response) => {
        if (!response.ok) throw new Error(`Nayanmar export HTTP ${response.status}`);
        return response.json() as Promise<PramanaExport>;
      }),
      fetch('/data/pramana-tirumurai8-v1.json').then((response) => {
        if (!response.ok) throw new Error(`Tirumurai 8 export HTTP ${response.status}`);
        return response.json() as Promise<Tirumurai8Snapshot>;
      }),
    ])
      .then(([graph, t8]) => {
        setData(graph);
        setTirumurai8(t8);
      })
      .catch((error) => console.error('Unable to load Pramāṇa product exports', error));
  }, []);

  const selectedIsManikkavasakar = selectedSaintId === MANIKKAVASAKAR_ID;

  const saint = useMemo(
    () => data?.saints.find((item) => item.id === selectedSaintId) ?? null,
    [data, selectedSaintId],
  );

  const siteById = useMemo(
    () => new Map((data?.sites ?? []).map((item) => [item.id, item])),
    [data],
  );

  const traditionalPlaceById = useMemo(
    () => new Map((data?.traditional_places ?? []).map((item) => [item.id, item])),
    [data],
  );

  const patikamById = useMemo(
    () => new Map((data?.patikams ?? []).map((item) => [item.id, item])),
    [data],
  );

  const authoredPatikams = useMemo(() => {
    if (!data || selectedIsManikkavasakar) return [];
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
  }, [data, selectedIsManikkavasakar, selectedSaintId]);

  const siteLinks = useMemo(() => {
    const result = new Map<string, string[]>();
    if (!data || selectedIsManikkavasakar) return result;
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
  }, [data, authoredPatikams, selectedIsManikkavasakar]);

  const tirumurai8LociBySite = useMemo(() => {
    const result = new Map<string, Tirumurai8Locus>();
    for (const locus of tirumurai8?.loci ?? []) result.set(locus.site_entity_id, locus);
    return result;
  }, [tirumurai8]);

  const epigraphicSiteIds = useMemo(
    () =>
      new Set(
        (data?.inscriptions ?? [])
          .map((item) => item.ifp_site_id)
          .filter(Boolean) as string[],
      ),
    [data],
  );

  const routeStops = useMemo<MapStop[]>(() => {
    if (selectedIsManikkavasakar) {
      return (tirumurai8?.loci ?? [])
        .map((locus) => {
          const seed = GEO_SEEDS.find((item) => item.siteId === locus.site_id);
          if (!seed) return null;
          return {
            ...seed,
            playbackRank: locus.playback_rank,
            hymnIds: locus.section_numbers.map((section) => `tirumurai8.section.${section}`),
          };
        })
        .filter((item): item is MapStop => Boolean(item))
        .sort((a, b) => a.playbackRank - b.playbackRank);
    }

    return GEO_SEEDS
      .map((seed) => ({
        ...seed,
        hymnIds: siteLinks.get(`tevaram_site.${seed.siteId}`) ?? [],
      }))
      .filter((item) => item.hymnIds.length)
      .sort((a, b) => a.playbackRank - b.playbackRank);
  }, [selectedIsManikkavasakar, siteLinks, tirumurai8]);

  const traditionalPlaybackStops = useMemo<PlaybackStop[]>(() => {
    if (!data || selectedIsManikkavasakar) return [];
    const rank: Record<string, number> = {
      BIRTHPLACE_TRADITION: 0,
      RELATED_PLACE_TRADITION: 1,
      MUKTI_PLACE_TRADITION: 2,
    };
    return data.edges
      .filter(
        (edge) =>
          edge.subject === selectedSaintId &&
          edge.predicate in rank,
      )
      .sort((a, b) => (rank[a.predicate] ?? 9) - (rank[b.predicate] ?? 9))
      .flatMap((edge) => {
        const place = traditionalPlaceById.get(edge.object);
        if (!place) return [];
        const detail =
          edge.predicate === 'BIRTHPLACE_TRADITION'
            ? 'Birthplace tradition'
            : edge.predicate === 'MUKTI_PLACE_TRADITION'
              ? 'Mukti-place tradition'
              : 'Related-place tradition';
        return [{
          id: `${edge.predicate}:${place.id}`,
          name: place.label_ta || place.label,
          detail,
          kind: 'traditional_place' as const,
        }];
      });
  }, [data, selectedIsManikkavasakar, selectedSaintId, traditionalPlaceById]);

  const playbackStops = useMemo<PlaybackStop[]>(() => {
    if (routeStops.length >= 2) {
      return routeStops.map((stop) => ({
        id: `mapped:${stop.siteId}`,
        name: stop.name,
        detail: selectedIsManikkavasakar
          ? `${stop.hymnIds.length} Tiruvācakam section locus${stop.hymnIds.length === 1 ? '' : 'i'}`
          : `${stop.hymnIds.length} linked Tēvāram patikam${stop.hymnIds.length === 1 ? '' : 's'}`,
        kind: 'exact_text_locus' as const,
        siteId: stop.siteId,
      }));
    }
    return traditionalPlaybackStops;
  }, [routeStops, selectedIsManikkavasakar, traditionalPlaybackStops]);

  const playbackIsGeographic = routeStops.length >= 2;
  const playbackKind = selectedIsManikkavasakar
    ? 'Tirumurai 8 textual loci'
    : playbackIsGeographic
      ? 'Mapped Tēvāram loci'
      : 'Traditional place sequence';

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

  const saintDistrictCoverage = useMemo<CoveragePoint[]>(() => {
    const counts = new Map<string, number>();

    if (selectedIsManikkavasakar) {
      for (const stop of routeStops) {
        const site = siteById.get(`tevaram_site.${stop.siteId}`);
        if (!site) continue;
        const key = normalizeDistrict(site.district);
        if (key === 'unknown') continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    } else {
      for (const siteId of siteLinks.keys()) {
        const site = siteById.get(siteId);
        if (!site) continue;
        const key = normalizeDistrict(site.district);
        if (key === 'unknown') continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return DISTRICT_CENTROIDS
      .map((district) => ({
        ...district,
        count: counts.get(district.key) ?? 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [routeStops, selectedIsManikkavasakar, siteById, siteLinks]);

  const topLinkedSites = useMemo(() => {
    if (selectedIsManikkavasakar) {
      return (tirumurai8?.loci ?? [])
        .map((locus) => ({
          site: siteById.get(locus.site_entity_id),
          count: locus.section_numbers.length,
        }))
        .filter((item): item is { site: Site; count: number } => Boolean(item.site))
        .sort((a, b) => b.count - a.count);
    }

    return [...siteLinks.entries()]
      .map(([siteId, patikams]) => ({
        site: siteById.get(siteId),
        count: patikams.length,
      }))
      .filter((item): item is { site: Site; count: number } => Boolean(item.site))
      .sort((a, b) => b.count - a.count || b.site.patikam_count - a.site.patikam_count)
      .slice(0, 6);
  }, [selectedIsManikkavasakar, siteById, siteLinks, tirumurai8]);

  const selectedSite = siteById.get(selectedSiteId) ?? null;
  const selectedPatikams = siteLinks.get(selectedSiteId) ?? [];
  const selectedTirumurai8Locus = tirumurai8LociBySite.get(selectedSiteId) ?? null;

  const episodeCount =
    selectedIsManikkavasakar
      ? 0
      : data?.edges.filter(
          (edge) =>
            edge.predicate === 'EPISODE_ABOUT_SAINT' &&
            edge.object === selectedSaintId,
        ).length ?? 0;

  const independentEdges =
    data?.edges.filter((edge) => edge.authority_scope === 'epigraphic_primary').length ?? 0;

  const searchResults = useMemo(() => {
    if (!data || !query.trim()) {
      return { saints: [] as Saint[], sites: [] as Site[], manikkavasakar: false };
    }
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

    const manikkavasakar = ['manikkavasakar', 'manikkavacakar', 'மாணிக்கவாசகர்']
      .some((value) => value.toLowerCase().includes(needle) || needle.includes(value.toLowerCase()));

    return { saints, sites, manikkavasakar };
  }, [data, query]);

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
  }, [selectedSaintId]);

  useEffect(() => {
    if (!playing || playbackStops.length < 2) return;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= playbackStops.length - 1) {
          setPlaying(false);
          return value;
        }
        return value + 1;
      });
    }, 1500);
    return () => window.clearInterval(timer);
  }, [playing, playbackStops.length]);

  if (!data || !tirumurai8) {
    return (
      <div className="loading">
        <div className="loading-mark"><GopuramIcon /></div>
        <div>Opening the Pramāṇa evidence atlas…</div>
      </div>
    );
  }

  const saintName = selectedIsManikkavasakar
    ? tirumurai8.author.display_label
    : SAINT_EN[selectedSaintId] ?? saint?.label ?? 'Nayanmar';
  const saintTamil = selectedIsManikkavasakar
    ? tirumurai8.author.label_ta
    : saint?.label_ta ?? '';
  const saintRegistryLabel = selectedIsManikkavasakar
    ? 'NAALVAR · TIRUMURAI 8'
    : `NAYANMAR ${saint?.ordinal ?? ''}`;
  const saintNumberLabel = selectedIsManikkavasakar ? 'N4' : saint?.ordinal;
  const activePlaybackStop =
    playbackStops[Math.min(progress, Math.max(0, playbackStops.length - 1))];
  const progressPct =
    playbackStops.length <= 1 ? 0 : (progress / (playbackStops.length - 1)) * 100;
  const saintMedia = SAINT_MEDIA[selectedSaintId];
  const templeMedia = selectedSite ? TEMPLE_MEDIA[selectedSite.id] : undefined;
  const selectedGeoSeed = selectedSite
    ? GEO_SEEDS.find((seed) => seed.siteId === selectedSite.site_id)
    : undefined;

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
              {searchResults.manikkavasakar && (
                <button
                  onClick={() => {
                    setSelectedSaintId(MANIKKAVASAKAR_ID);
                    setQuery('');
                  }}
                >
                  <GopuramIcon />
                  <span>
                    Manikkavasakar
                    <small>Naalvar · Tirumurai 8 · not numbered among the 63</small>
                  </span>
                </button>
              )}
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
                    {siteDisplayName(item)}
                    <small>{cleanLabel(item.label)} · {item.district || item.site_id}</small>
                  </span>
                </button>
              ))}
              {!searchResults.saints.length && !searchResults.sites.length && !searchResults.manikkavasakar && (
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
        <img className="hero-photo" src={HERO_MEDIA.src} alt="" />
        <div className="hero-photo-shade" />
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
        <small className="hero-credit">{HERO_MEDIA.source} · {HERO_MEDIA.license}</small>
      </section>

      <section className="filters">
        <Filter label="Saint">
          <select value={selectedSaintId} onChange={(event) => setSelectedSaintId(event.target.value)}>
            <optgroup label="Naalvar">
              <option value="nayanmar.20">Appar · Tirunavukkarasar</option>
              <option value="nayanmar.27">Sambandar</option>
              <option value="nayanmar.63">Sundarar · Arurar</option>
              <option value={MANIKKAVASAKAR_ID}>Manikkavasakar · Tirumurai 8</option>
            </optgroup>
            <optgroup label="63 Nayanmar registry">
              {data.saints.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.ordinal}. {SAINT_EN[item.id] ?? item.label}
                </option>
              ))}
            </optgroup>
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
            <div className="saint-number">{saintNumberLabel}</div>
            <div className="saint-temple"><GopuramIcon /></div>
            {saintMedia && (
              <small className="media-credit">
                {saintMedia.source} · {saintMedia.license}
              </small>
            )}
          </div>

          <div className="saint-heading">
            <small>{saintRegistryLabel}</small>
            <h2>{saintName}</h2>
            <div className="tamil">{saintTamil}</div>
          </div>

          <div className="identity-line">
            <GopuramIcon />
            {selectedIsManikkavasakar
              ? 'Naalvar · Tirumurai 8 companion'
              : '63-Nayanmar traditional identity'}
          </div>

          <blockquote className="saint-quote">
            The devotional story remains vivid; the evidence layer remains explicit.
          </blockquote>

          <div className="stat-grid">
            {selectedIsManikkavasakar ? (
              <>
                <Stat value={tirumurai8.works.tiruvacakam.sections} label="Tiruvācakam sections" />
                <Stat value={tirumurai8.works.tiruvacakam.source_units} label="source units" />
                <Stat value={tirumurai8.works.tirukkovaiyar.source_order_units} label="Tirukkōvaiyār units" />
                <Stat value={routeStops.length} label="mapped textual loci" />
              </>
            ) : (
              <>
                <Stat value={authoredPatikams.length} label="Tēvāram patikams" />
                <Stat value={siteLinks.size} label="linked talams" />
                <Stat value={episodeCount} label="Periya Puranam links" />
                <Stat value={playbackStops.length} label="playback stops" />
              </>
            )}
          </div>

          <div className="major-temples">
            <div className="section-title">
              <h3>{selectedIsManikkavasakar ? 'Tirumurai 8 textual loci' : 'Major linked talams'}</h3>
              <span>{selectedIsManikkavasakar ? tirumurai8.loci.length : siteLinks.size} total</span>
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
                <span>{siteDisplayName(site)}</span>
                <small>{count}</small>
              </button>
            ))}
          </div>

          <div className="journey-progress">
            <div>
              <b>Playback progress</b>
              <span>{playbackStops.length ? Math.min(progress + 1, playbackStops.length) : 0} / {playbackStops.length}</span>
            </div>
            <div className="mini-track"><i style={{ width: `${progressPct}%` }} /></div>
          </div>

          <div className="authority-box">
            <b>{selectedIsManikkavasakar ? 'Tirumurai 8 authority boundary' : MODE_COPY[mode].short}</b>
            <p>
              {selectedIsManikkavasakar
                ? 'Pramāṇa preserves the Tiruvācakam/Tirukkōvaiyār edition loci; the two plotted modern centroids and the line between them are product presentation, not a historical journey claim.'
                : MODE_COPY[mode].body}
            </p>
          </div>
        </aside>

        <section className="panel map-card">
          <div className="map-toolbar">
            <div className="map-toolbar-left">
              <GopuramIcon />
              <span>Static atlas · {selectedIsManikkavasakar ? 'Tirumurai 8' : MODE_COPY[mode].short}</span>
            </div>
            <div className="map-toolbar-stats">
              <span>
                <b>{selectedIsManikkavasakar ? tirumurai8.loci.length : playbackIsGeographic ? siteLinks.size : traditionalPlaybackStops.length}</b>
                {selectedIsManikkavasakar ? ' textual loci' : playbackIsGeographic ? ' linked talams' : ' traditional places'}
              </span>
              <span><b>{saintDistrictCoverage.length}</b> mapped districts</span>
              <span><b>{routeStops.length}</b> exact exemplars</span>
            </div>
          </div>

          <SacredMap
            routeStops={routeStops}
            coverage={saintDistrictCoverage}
            selectedSiteId={selectedSiteId}
            mode={mode}
            progress={progress}
            epigraphicSiteIds={epigraphicSiteIds}
            travelerImage={saintMedia?.src}
            showUnlinkedExemplars={playbackIsGeographic}
            onSelect={(siteId) => {
              setSelectedSiteId(siteId);
              setTab('visits');
            }}
          />

          <div className="map-legend">
            <b>Evidence legend</b>
            <span><i className="legend-tower"><GopuramIcon /></i> exact modern centroid for a mapped exemplar</span>
            {playbackIsGeographic ? (
              <span><i className="legend-route" /> line between known endpoints — product presentation, not historical road</span>
            ) : (
              <span><i className="legend-tradition" /> traditional place sequence plays below without invented coordinates</span>
            )}
            <span><i className="legend-coverage" /> selected-saint linked-talam density by normalized modern district</span>
            <span><i className="legend-independent" /> explicit independent epigraphic support</span>
          </div>

          <div className="map-source-note">
            OpenFreeMap / OpenStreetMap basemap · Pramāṇa data overlay
          </div>

          {!playbackIsGeographic && traditionalPlaybackStops.length > 0 && (
            <div className="map-fallback-note">
              <Badge kind="tradition">TRADITION PLAYBACK</Badge>
              <b>{traditionalPlaybackStops.length} Pramāṇa place traditions are available for {saintName}</b>
              <p>
                They play in the timeline below. Pramāṇa does not yet provide reviewed coordinates for these place nodes,
                so Nayanmar Trails deliberately does not draw a fake geographic route.
              </p>
            </div>
          )}

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
                {item === 'visits'
                  ? selectedIsManikkavasakar ? 'Textual Loci' : 'Temple Visits'
                  : item[0].toUpperCase() + item.slice(1)}
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
                <h2>{selectedSite ? siteDisplayName(selectedSite) : 'Select a talam'}</h2>
                <p>{selectedSite ? `${cleanLabel(selectedSite.label)}${selectedSite.label_ta ? ` · ${selectedSite.label_ta}` : ''}` : ''}</p>
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
                  {selectedIsManikkavasakar ? (
                    <span>
                      {selectedTirumurai8Locus
                        ? `${selectedTirumurai8Locus.section_numbers.length} Tiruvācakam section ${selectedTirumurai8Locus.section_numbers.length === 1 ? 'locus' : 'loci'}`
                        : 'no mapped Tirumurai 8 locus'}
                    </span>
                  ) : (
                    <span>{selectedPatikams.length} by {saintName.split(' · ')[0]}</span>
                  )}
                </div>

                {selectedIsManikkavasakar ? (
                  <>
                    {(tab === 'visits' || tab === 'hymns') && (
                      <Tirumurai8LocusDetail
                        locus={selectedTirumurai8Locus}
                        view={tab}
                      />
                    )}
                    {tab === 'chronology' && (
                      <Tirumurai8Chronology snapshot={tirumurai8} />
                    )}
                    {tab === 'evidence' && (
                      <Tirumurai8Evidence
                        locus={selectedTirumurai8Locus}
                        site={selectedSite}
                        snapshot={tirumurai8}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {tab === 'visits' && (
                      <Visits
                        site={selectedSite}
                        saintName={saintName}
                        count={selectedPatikams.length}
                        patikamIds={selectedPatikams}
                        patikamById={patikamById}
                      />
                    )}
                    {tab === 'hymns' && (
                      <Hymns ids={selectedPatikams} patikamById={patikamById} />
                    )}
                    {tab === 'chronology' && <Chronology />}
                    {tab === 'evidence' && <Evidence site={selectedSite} data={data} />}
                  </>
                )}

                <div className="temple-facts">
                  <Fact label="Traditional class" value={selectedSite.traditional_location_class || 'Not supplied'} />
                  <Fact label="Modern catalog" value={selectedSite.modern_name_nic || selectedSite.district || 'Not supplied'} />
                  <Fact label="Map geometry" value={selectedGeoSeed ? 'Exact modern centroid exemplar' : 'District-level corpus context only'} />
                  <Fact
                    label="Selected-saint evidence"
                    value={
                      selectedIsManikkavasakar
                        ? selectedTirumurai8Locus
                          ? 'Tirumurai 8 textual locus'
                          : 'No mapped Tirumurai 8 locus'
                        : authorityLabel(selectedSite.authority_scope)
                    }
                  />
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
                  <GopuramIcon /> View on static map →
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
              <h3>{playbackKind} Playback</h3>
              <p>
                {playbackIsGeographic
                  ? <>Mapped textual loci in presentation order — <b>not a historical road or chronology.</b></>
                  : <>Pramāṇa birth/related/mukti place traditions — <b>not geocoded or historical chronology.</b></>}
              </p>
            </div>
            <Badge kind={playbackIsGeographic ? 'inference' : 'tradition'}>
              {playbackIsGeographic ? 'PRESENTATION' : 'TRADITION'}
            </Badge>
          </div>

          <div className="play-row">
            <button
              className="play"
              disabled={playbackStops.length < 1}
              onClick={() => {
                if (playbackStops.length === 1) {
                  setProgress(0);
                  setPlaying(false);
                  return;
                }
                if (progress >= playbackStops.length - 1) setProgress(0);
                setPlaying((value) => !value);
              }}
            >
              {playing ? 'Ⅱ' : '▶'}
            </button>

            <div className="track">
              <div className="fill" style={{ width: `${progressPct}%` }} />
              {playbackStops.map((stop, index) => (
                <button
                  key={stop.id}
                  title={`${stop.name} · ${stop.detail}`}
                  className={`stop ${index <= progress ? 'reached' : ''} ${stop.kind === 'traditional_place' ? 'traditional-stop' : ''}`}
                  style={{
                    left: `${playbackStops.length <= 1 ? 0 : (index / (playbackStops.length - 1)) * 100}%`,
                  }}
                  onClick={() => {
                    setProgress(index);
                    if (stop.siteId) setSelectedSiteId(`tevaram_site.${stop.siteId}`);
                  }}
                />
              ))}
            </div>

            <div className="now">
              {activePlaybackStop ? (
                <>
                  <b>{activePlaybackStop.name}</b>
                  <small>{activePlaybackStop.detail}</small>
                </>
              ) : (
                <>
                  <b>No playback evidence yet</b>
                  <small>No mapped loci or traditional place references are available for this selection.</small>
                </>
              )}
            </div>
          </div>

          <div className="timeline-labels">
            {playbackStops.slice(0, 6).map((stop) => (
              <span key={stop.id}>{stop.name}</span>
            ))}
          </div>

          <div className="saint-registry">
            <div className="registry-copy">
              <b>Naalvar + 63-saint registry</b>
              <small>Manikkavasakar is Naalvar, not a 64th Nayanmar</small>
            </div>
            <div className="registry-stack">
              <div className="naalvar-mini">
                {NAALVAR.map((id) => (
                  <button
                    key={id}
                    className={id === selectedSaintId ? 'selected' : ''}
                    onClick={() => setSelectedSaintId(id)}
                  >
                    {id === MANIKKAVASAKAR_ID
                      ? 'Manikkavasakar'
                      : SAINT_EN[id]?.split(' · ')[0]}
                  </button>
                ))}
              </div>
              <div className="registry-dots">
                {data.saints
                  .slice()
                  .sort((a, b) => a.ordinal - b.ordinal)
                  .map((item) => (
                    <button
                      key={item.id}
                      title={SAINT_EN[item.id] ?? item.label}
                      className={item.id === selectedSaintId ? 'selected' : ''}
                      onClick={() => setSelectedSaintId(item.id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel graph-mini">
          <div className="section-title">
            <h3>{selectedIsManikkavasakar ? 'Tirumurai 8 – Talam Graph' : 'Saint – Talam Graph'}</h3>
            <span>
              {selectedIsManikkavasakar
                ? `${tirumurai8.loci.length} textual loci`
                : `${siteLinks.size} linked talams`}
            </span>
          </div>
          <Network
            saint={saint}
            centerLabel={selectedIsManikkavasakar ? 'M' : undefined}
            sites={topLinkedSites.slice(0, 8)}
          />
        </div>

        <div className="panel density-card">
          <div className="section-title">
            <h3>Corpus Density</h3>
            <span>all 276 Tēvāram catalog sites</span>
          </div>
          <DensityPanel points={districtCoverage.slice(0, 6)} />
        </div>

        <div className="panel totals">
          <Stat value={data.meta.counts.saints} label="Nayanmars" />
          <Stat value={4} label="Naalvar" />
          <Stat value={data.meta.counts.tevaram_patikams} label="Tēvāram patikams" />
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


function Tirumurai8LocusDetail({
  locus,
  view,
}: {
  locus: Tirumurai8Locus | null;
  view: 'visits' | 'hymns';
}) {
  if (!locus) {
    return (
      <div className="text">
        <Badge kind="edition">NO MAPPED TIRUMURAI 8 LOCUS</Badge>
        <p>
          This talam is part of the broader Tēvāram catalog, but the pinned Tirumurai 8 product snapshot does not map a Manikkavasakar textual locus here.
        </p>
      </div>
    );
  }

  return (
    <div className="text">
      <Badge kind="edition">TIRUMURAI 8 · SOURCE-PRESERVED LOCUS</Badge>
      {view === 'visits' ? (
        <p>
          This view is a <b>textual-locus mapping</b>, not a claim that Pramāṇa has established a historical temple visit or a travel sequence for Manikkavasakar.
        </p>
      ) : (
        <p>
          The pinned Tiruvācakam edition metadata associates this product locus with the following section title{locus.section_numbers.length === 1 ? '' : 's'}.
        </p>
      )}

      <div className="locus-strip">
        <small>TIRUVĀCAKAM SECTIONS</small>
        <div>
          {locus.section_numbers.map((section, index) => (
            <span key={section} title={locus.section_titles_ta[index]}>
              <GopuramIcon />
              Section {section}
            </span>
          ))}
        </div>
      </div>

      <ul className="t8-section-list">
        {locus.section_titles_ta.map((title, index) => (
          <li key={locus.id + ':' + index}>
            <b>{locus.section_numbers[index]}</b>
            <span>{title}</span>
          </li>
        ))}
      </ul>

      <div className="evidence-callout">
        <GopuramIcon />
        <p>{locus.locus_basis}</p>
      </div>
    </div>
  );
}

function Tirumurai8Chronology({ snapshot }: { snapshot: Tirumurai8Snapshot }) {
  return (
    <div className="text">
      <Badge kind="inference">FAIL-CLOSED BIOGRAPHICAL CHRONOLOGY</Badge>
      <p>
        Pramāṇa v1 has a beta-ready Tiruvācakam/Tirukkōvaiyār edition corpus, but it does not automatically turn section order into Manikkavasakar's historical itinerary.
      </p>
      <div className="evidence-callout">
        <GopuramIcon />
        <p>{snapshot.meta.playback_policy}</p>
      </div>
    </div>
  );
}

function Tirumurai8Evidence({
  locus,
  site,
  snapshot,
}: {
  locus: Tirumurai8Locus | null;
  site: Site;
  snapshot: Tirumurai8Snapshot;
}) {
  return (
    <div className="text">
      <Badge kind="edition">{snapshot.authority.text.replace(/_/g, ' ')}</Badge>
      <p>
        Tirumurai 8 is pinned from Pramāṇa release <b>{snapshot.meta.release_id}</b>. Historical authority remains <b>{snapshot.authority.historical.replace(/_/g, ' ')}</b>.
      </p>
      {locus ? (
        <div className="inscription">
          <Badge kind="edition">TEXTUAL LOCUS</Badge>
          <b>{locus.display_name}</b>
          <p>{locus.locus_basis}</p>
        </div>
      ) : (
        <div className="evidence-callout muted">
          <GopuramIcon />
          <p>No Tirumurai 8 textual-locus mapping is attached to {siteDisplayName(site)} in this product snapshot.</p>
        </div>
      )}
    </div>
  );
}

function Visits({
  site,
  saintName,
  count,
  patikamIds,
  patikamById,
}: {
  site: Site;
  saintName: string;
  count: number;
  patikamIds: string[];
  patikamById: Map<string, { tirumurai: number; patikam: number }>;
}) {
  return (
    <div className="text">
      <Badge kind="edition">EDITION METADATA</Badge>
      <p>
        <b>{saintName}</b> is linked to <b>{count}</b> Tēvāram patikam
        {count === 1 ? '' : 's'} associated with this traditional talam in the current Pramāṇa graph.
      </p>

      {patikamIds.length > 0 && (
        <div className="locus-strip">
          <small>TĒVĀRAM LOCI</small>
          <div>
            {patikamIds.slice(0, 3).map((id) => {
              const item = patikamById.get(id);
              return (
                <span key={id}>
                  <GopuramIcon />
                  {item ? `T${item.tirumurai} · P${item.patikam}` : id.replace('tevaram.ifp.', '')}
                </span>
              );
            })}
          </div>
        </div>
      )}

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
  centerLabel,
}: {
  saint: Saint | null;
  sites: Array<{ site: Site; count: number }>;
  centerLabel?: string;
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
        {centerLabel ?? saint?.ordinal ?? '—'}
      </text>
    </svg>
  );
}

function DensityPanel({ points }: { points: CoveragePoint[] }) {
  const width = 180;
  const height = 118;
  const bounds = { minLng: 76.7, maxLng: 80.55, minLat: 7.85, maxLat: 13.65 };
  const project = (lng: number, lat: number) => {
    const x = 22 + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 122;
    const y = 8 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 101;
    return [x, y] as const;
  };
  const polygon = TAMIL_NADU_SCHEMATIC
    .map(([lng, lat]) => project(lng, lat).join(','))
    .join(' ');
  const max = Math.max(...points.map((item) => item.count), 1);

  return (
    <div className="density-map">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Pramāṇa talam density by modern catalog district">
        <defs>
          <filter id="densityGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <polygon points={polygon} className="density-land" />
        {points.map((point) => {
          const [x, y] = project(point.lng, point.lat);
          const radius = 4 + (point.count / max) * 10;
          return (
            <g key={point.key}>
              <circle cx={x} cy={y} r={radius * 1.55} className="density-glow" filter="url(#densityGlow)" />
              <circle cx={x} cy={y} r={radius} className="density-hotspot" />
              <text x={x} y={y + 2} textAnchor="middle">{point.count}</text>
            </g>
          );
        })}
      </svg>
      <div className="density-caption">
        <span>district aggregate</span>
        <i />
        <span>higher corpus density</span>
      </div>
    </div>
  );
}
