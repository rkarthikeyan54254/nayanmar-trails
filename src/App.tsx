import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { GEO_SEEDS, TAMIL_NADU_SCHEMATIC } from './geometry';
import { DISTRICT_CENTROIDS, normalizeDistrict } from './coverage';
import { HERO_MEDIA, SAINT_MEDIA, TEMPLE_MEDIA } from './media';
import GopuramIcon from './GopuramIcon';
import SacredMap, { type CoveragePoint, type EvidenceMode, type MapStop } from './SacredMap';
import type { Patikam, PramanaExport, Saint, Site } from './types';
import { LocaleContext, T, tr, useLocale, type Locale } from './i18n';
import { companionPath, parsePublicRoute, saintPath, sitePath, storyPath } from './publicRoutes';
import { ShareButton, StartHere, StoryFocus, SaintShare, SiteShare } from './V1Discovery';
import QuestMode, { QuestInvitation } from './QuestMode';
import { track } from './analytics';

type DetailTab = 'hymns' | 'chronology' | 'visits' | 'evidence';

const MANIKKAVASAKAR_ID = 'tirumurai8.manikkavacakar';
const MUVAR = ['nayanmar.20', 'nayanmar.27', 'nayanmar.63'];
const NAALVAR = [...MUVAR, MANIKKAVASAKAR_ID];

type Tirumurai8Locus = {
  id: string;
  site_id: string | null;
  site_entity_id: string;
  locus_kind?: string;
  source_note_ta?: string;
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

type SaivaLiteraryPlace = {
  id: string;
  label: string;
  label_ta: string;
  aliases: string[];
  tevaram_site_catalogue_member: boolean;
  geometry_status: string;
};

type SaivaLiteraryLink = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  authority_scope: string;
  historical_verified: boolean;
  source_key: string;
  locator: string;
  source_note_ta?: string;
  source_header_composition_place_ta?: string;
  source_form_ta?: string;
  normalized_place_ta?: string;
  alias_resolution_source_key?: string;
  formal_tevaram_sthalam_classification?: string;
  traditional_place_ta?: string;
  modern_name_in_ifp_catalogue?: string;
  display_note: string;
};

type SaivaLiterarySnapshot = {
  meta: {
    export_version: string;
    source_repo: string;
    source_commit: string;
    source_path: string;
    authority_semantics: Record<string, string>;
  };
  places: SaivaLiteraryPlace[];
  links: SaivaLiteraryLink[];
};

type SaintCuriosity = {
  saint_id: string;
  ordinal: number;
  hook_en: string;
  hook_ta: string;
  authority_scope: string;
  source_work: string;
  presentation_policy: string;
};

type SaintCuriositySnapshot = {
  meta: {
    version: string;
    purpose: string;
    authority_scope: string;
    source_repo: string;
    source_commit: string;
    source_basis: string;
    language_policy: string;
  };
  stories: SaintCuriosity[];
};

type PlaybackStop = {
  id: string;
  name: string;
  detail: string;
  kind: 'exact_text_locus' | 'traditional_place';
  siteId?: string;
};

const SAINT_EN: Record<string, string> = {
  'nayanmar.01': 'Thirunilakanda Nayanar',
  'nayanmar.02': 'Iyarpakai Nayanar',
  'nayanmar.03': 'Ilaiyankudi Mara Nayanar',
  'nayanmar.04': 'Meypporul Nayanar',
  'nayanmar.05': 'Viranminda Nayanar',
  'nayanmar.06': 'Amarnidhi Nayanar',
  'nayanmar.07': 'Eripaththa Nayanar',
  'nayanmar.08': 'Enathi Natha Nayanar',
  'nayanmar.09': 'Kannappa Nayanar',
  'nayanmar.10': 'Kunkiliyak Kalaya Nayanar',
  'nayanmar.11': 'Manak Kanchara Nayanar',
  'nayanmar.12': 'Arivattaya Nayanar',
  'nayanmar.13': 'Anaya Nayanar',
  'nayanmar.14': 'Murthi Nayanar',
  'nayanmar.15': 'Muruga Nayanar',
  'nayanmar.16': 'Rudra Pasupathi Nayanar',
  'nayanmar.17': 'Thirunalaip Povar · Nandanar',
  'nayanmar.18': 'Thirukkurippu Thondar',
  'nayanmar.19': 'Chandesha Nayanar',
  'nayanmar.20': 'Appar · Tirunavukkarasar',
  'nayanmar.21': 'Kulachirai Nayanar',
  'nayanmar.22': 'Perumizhalai Kurumba Nayanar',
  'nayanmar.23': 'Karaikkal Ammaiyar',
  'nayanmar.24': 'Appudhi Adigal',
  'nayanmar.25': 'Thiru Nilanakka Nayanar',
  'nayanmar.26': 'Naminandi Adigal',
  'nayanmar.27': 'Sambandar',
  'nayanmar.28': 'Eyarkon Kalikkamar',
  'nayanmar.29': 'Thirumular',
  'nayanmar.30': 'Dandi Adigal',
  'nayanmar.31': 'Murkha Nayanar',
  'nayanmar.32': 'Somasi Mara Nayanar',
  'nayanmar.33': 'Sakkiya Nayanar',
  'nayanmar.34': 'Sirappuli Nayanar',
  'nayanmar.35': 'Siruthonda Nayanar',
  'nayanmar.36': 'Cheraman Perumal Nayanar',
  'nayanmar.37': 'Gana Natha Nayanar',
  'nayanmar.38': 'Kootruva Nayanar',
  'nayanmar.39': 'Pugazh Chola Nayanar',
  'nayanmar.40': 'Narasinga Munaiyaraiyar',
  'nayanmar.41': 'Adipaththa Nayanar',
  'nayanmar.42': 'Kalikkamba Nayanar',
  'nayanmar.43': 'Kaliya Nayanar',
  'nayanmar.44': 'Satti Nayanar',
  'nayanmar.45': 'Aiyadigal Kadavar Kon Nayanar',
  'nayanmar.46': 'Kanampulla Nayanar',
  'nayanmar.47': 'Kari Nayanar',
  'nayanmar.48': 'Ninra Sir Nedumara Nayanar',
  'nayanmar.49': 'Vayilar Nayanar',
  'nayanmar.50': 'Munaiyaduvar Nayanar',
  'nayanmar.51': 'Kazharsinga Nayanar',
  'nayanmar.52': 'Idangazhi Nayanar',
  'nayanmar.53': 'Seruthunai Nayanar',
  'nayanmar.54': 'Pugazhthunai Nayanar',
  'nayanmar.55': 'Kotpuli Nayanar',
  'nayanmar.56': 'Pusalar Nayanar',
  'nayanmar.57': 'Mangayarkkarasiyar',
  'nayanmar.58': 'Nesa Nayanar',
  'nayanmar.59': 'Kochengat Chola Nayanar',
  'nayanmar.60': 'Thirunilakanda Yazhpanar',
  'nayanmar.61': 'Sadaiya Nayanar',
  'nayanmar.62': 'Isaignaniyar',
  'nayanmar.63': 'Sundarar · Arurar',
};

const MODE_COPY: Record<EvidenceMode, { label: string; short: string; body: string }> = {
  all: {
    label: 'Everything',
    short: 'Sacred geography',
    body: 'See text-linked sthalams, traditional associations and independently attested places together. Journey lines are visual reconstructions, not claimed historical roads.',
  },
  edition: {
    label: 'Tēvāram',
    short: 'Tēvāram-linked',
    body: 'Show sthalams linked through the Tēvāram editions and the selected saint’s pathigams.',
  },
  tradition: {
    label: 'Tradition',
    short: 'Traditional places',
    body: 'Show birthplace, related-place and mukti-place traditions without converting them into precise historical claims.',
  },
  independent: {
    label: 'Historical',
    short: 'Historically attested',
    body: 'Show mapped places with independent inscriptional support and hide reconstructed routes.',
  },
};

function authorityLabel(scope: string, locale: Locale = 'en') {
  if (locale === 'ta') {
    if (scope === 'edition_metadata') return 'தேவாரப் பதிப்புப் பட்டியல்';
    if (scope === 'traditional_reference') return 'மரபு நூல்';
    if (scope === 'primary_text_metadata') return 'இலக்கிய மூலச் சான்று';
    if (scope === 'epigraphic_primary') return 'கல்வெட்டுச் சான்று';
  }
  if (scope === 'edition_metadata') return 'Tēvāram catalogue';
  if (scope === 'traditional_reference') return 'Traditional source';
  if (scope === 'primary_text_metadata') return 'Literary source';
  if (scope === 'epigraphic_primary') return 'Historical inscription';
  return scope.replace(/_/g, ' ');
}

function identificationLabel(status: string, locale: Locale = 'en') {
  if (status === 'traditional_talam_not_assumed_single_modern_temple') {
    return locale === 'ta'
      ? 'மரபில் சொல்லப்படும் தலம்; இன்றைய ஒரே கோயிலுடன் இதை நாங்கள் உறுதியாக அடையாளப்படுத்தவில்லை.'
      : 'Traditional sthalam; no single modern temple identity is asserted.';
  }
  if (locale === 'ta') return status.replace(/_/g, ' ');
  return status
    .replace(/_/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function cleanLabel(label: string) {
  return label
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function modernShort(value: string | null | undefined) {
  if (!value) return '';
  let current = value.trim().replace(/^\([^)]*\)\s*/, '');
  if (current.includes('[[')) current = current.split('[[')[0].trim();
  current = current.replace(/\s*\[[^\]]*\]\s*$/, '').trim();
  const beforeParen = current.split('(')[0].trim();
  return beforeParen || current;
}

function siteDisplayName(site: Site) {
  const mapped = GEO_SEEDS.find((seed) => seed.siteId === site.site_id);
  return mapped?.name || modernShort(site.modern_name_nic) || cleanLabel(site.label);
}

const TA_ADMIN_NAMES: Record<string, string> = {
  'tiruvallur': 'திருவள்ளூர்',
  'thiruvallur': 'திருவள்ளூர்',
  'chennai': 'சென்னை',
  'chengalpattu': 'செங்கல்பட்டு',
  'kanchipuram': 'காஞ்சிபுரம்',
  'vellore': 'வேலூர்',
  'ranipet': 'ராணிப்பேட்டை',
  'tirupattur': 'திருப்பத்தூர்',
  'tiruvannamalai': 'திருவண்ணாமலை',
  'villupuram': 'விழுப்புரம்',
  'kallakurichi': 'கள்ளக்குறிச்சி',
  'cuddalore': 'கடலூர்',
  'mayiladuthurai': 'மயிலாடுதுறை',
  'nagapattinam': 'நாகப்பட்டினம்',
  'tiruvarur': 'திருவாரூர்',
  'thanjavur': 'தஞ்சாவூர்',
  'tiruchirappalli': 'திருச்சிராப்பள்ளி',
  'trichy': 'திருச்சிராப்பள்ளி',
  'perambalur': 'பெரம்பலூர்',
  'ariyalur': 'அரியலூர்',
  'pudukkottai': 'புதுக்கோட்டை',
  'madurai': 'மதுரை',
  'sivaganga': 'சிவகங்கை',
  'ramanathapuram': 'இராமநாதபுரம்',
  'virudhunagar': 'விருதுநகர்',
  'thoothukudi': 'தூத்துக்குடி',
  'tuticorin': 'தூத்துக்குடி',
  'tirunelveli': 'திருநெல்வேலி',
  'tenkasi': 'தென்காசி',
  'kanyakumari': 'கன்னியாகுமரி',
  'coimbatore': 'கோயம்புத்தூர்',
  'tiruppur': 'திருப்பூர்',
  'erode': 'ஈரோடு',
  'namakkal': 'நாமக்கல்',
  'salem': 'சேலம்',
  'dharmapuri': 'தர்மபுரி',
  'krishnagiri': 'கிருஷ்ணகிரி',
  'nilgiris': 'நீலகிரி',
  'ambattur': 'அம்பத்தூர்',
  'chidambaram': 'சிதம்பரம்',
  'sirkazhi': 'சீர்காழி',
  'kumbakonam': 'கும்பகோணம்',
  'rameswaram': 'இராமேச்சுரம்',
};

const TA_SACRED_REGIONS: Record<string, string> = {
  'tontai natu': 'தொண்டை நாடு',
  'natu natu': 'நடுநாடு',
  'chola natu': 'சோழ நாடு',
  'cola natu': 'சோழ நாடு',
  'pantiya natu': 'பாண்டிய நாடு',
  'pandya natu': 'பாண்டிய நாடு',
  'konku natu': 'கொங்கு நாடு',
  'malai natu': 'மலைநாடு',
};

function latinKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function localizedAdministrativeName(value: string | null | undefined, locale: Locale) {
  if (!value || locale !== 'ta') return value || '';
  return TA_ADMIN_NAMES[latinKey(value)] ?? value;
}

function localizedSacredRegion(value: string | null | undefined, locale: Locale) {
  if (!value) return '';
  const cleaned = value
    .replace(/^according to PK:\s*/i, '')
    .replace(/\s*\([A-Z]{2}\d+\)\s*$/, '')
    .trim();
  if (locale !== 'ta') return cleaned;
  return TA_SACRED_REGIONS[latinKey(cleaned)] ?? cleaned;
}

function localizedSiteName(site: Site, locale: Locale) {
  if (locale === 'ta') {
    if (site.label_ta) return site.label_ta;
    const mapped = GEO_SEEDS.find((seed) => seed.siteId === site.site_id);
    if (mapped?.nameTa) return mapped.nameTa;
    const tamilAlias = site.aliases?.find((alias) => /[\u0B80-\u0BFF]/.test(alias));
    if (tamilAlias) return cleanLabel(tamilAlias);
  }
  return siteDisplayName(site);
}

function localizedSaintName(saint: Saint | null, locale: Locale) {
  if (!saint) return locale === 'ta' ? 'நாயன்மார்' : 'Nayanmar';
  if (locale === 'ta' && saint.label_ta) return saint.label_ta;
  return SAINT_EN[saint.id] ?? saint.label;
}

export default function App() {
  const initialRouteRef = useRef(parsePublicRoute(window.location.pathname));
  const initialRoute = initialRouteRef.current;
  const initialParamsRef = useRef(new URLSearchParams(window.location.search));
  const initialParams = initialParamsRef.current;
  const showStartHere = initialRoute?.kind === 'home' || (
    !initialRoute &&
    !initialParams.get('saint') &&
    !initialParams.get('site') &&
    !initialParams.get('story')
  );

  const [data, setData] = useState<PramanaExport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tirumurai8, setTirumurai8] = useState<Tirumurai8Snapshot | null>(null);
  const [saivaPlaces, setSaivaPlaces] = useState<SaivaLiterarySnapshot | null>(null);
  const [curiosities, setCuriosities] = useState<SaintCuriositySnapshot | null>(null);
  const [locale, setLocale] = useState<Locale>(() =>
    initialRoute?.locale ?? (initialParams.get('lang') === 'ta' ? 'ta' : 'en'),
  );
  const [selectedSaintId, setSelectedSaintId] = useState(() => {
    if (initialRoute?.kind === 'saint' || initialRoute?.kind === 'story') {
      return `nayanmar.${String(initialRoute.ordinal).padStart(2, '0')}`;
    }
    if (initialRoute?.kind === 'companion') return MANIKKAVASAKAR_ID;
    return initialParams.get('saint') || 'nayanmar.20';
  });
  const [selectedSiteId, setSelectedSiteId] = useState(() => {
    if (initialRoute?.kind === 'sthalam') return `tevaram_site.${initialRoute.siteId}`;
    const site = initialParams.get('site');
    return site ? (site.startsWith('tevaram_site.') ? site : `tevaram_site.${site}`) : 'tevaram_site.KV01';
  });
  const [mode, setMode] = useState<EvidenceMode>(() => {
    const value = initialParams.get('mode');
    return value === 'edition' || value === 'tradition' || value === 'independent' ? value : 'all';
  });
  const [tab, setTab] = useState<DetailTab>(() => {
    const value = new URLSearchParams(window.location.search).get('tab');
    return value === 'hymns' || value === 'chronology' || value === 'evidence' ? value : 'visits';
  });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [graphOpen, setGraphOpen] = useState(
    () => new URLSearchParams(window.location.search).get('graph') === '1',
  );
  const [sourcesOpen, setSourcesOpen] = useState(
    () => initialParams.get('sources') === '1',
  );
  const [storyOpen, setStoryOpen] = useState(
    () => initialRoute?.kind === 'story' || initialParams.get('story') === '1',
  );
  const questInitialKey = initialParams.get('quest');
  const [questOpen, setQuestOpen] = useState(
    () => Boolean(questInitialKey),
  );
  const questInitialStep = Math.max(0, Number(initialParams.get('questStep') || 0) || 0);
  const [query, setQuery] = useState('');
  const didInitSaintSelection = useRef(false);
  const preserveInitialSiteDeepLink = useRef(
    initialRoute?.kind === 'sthalam' || Boolean(initialParams.get('site')),
  );
  const preserveInitialTabDeepLink = useRef(
    Boolean(initialParams.get('tab')),
  );

  useEffect(() => {
    if (!graphOpen && !sourcesOpen && !storyOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGraphOpen(false);
        setSourcesOpen(false);
        setStoryOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [graphOpen, sourcesOpen, storyOpen]);

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
      fetch('/data/pramana-saiva-literary-place-links-v1.json').then((response) => {
        if (!response.ok) throw new Error(`Saiva literary-place export HTTP ${response.status}`);
        return response.json() as Promise<SaivaLiterarySnapshot>;
      }),
      fetch('/data/pramana-saint-curiosities-v1.json').then((response) => {
        if (!response.ok) throw new Error(`Saint curiosity export HTTP ${response.status}`);
        return response.json() as Promise<SaintCuriositySnapshot>;
      }),
    ])
      .then(([graph, t8, literaryPlaces, saintCuriosities]) => {
        setData(graph);
        setTirumurai8(t8);
        setSaivaPlaces(literaryPlaces);
        setCuriosities(saintCuriosities);
      })
      .catch((error) => {
        console.error('Unable to load Pramāṇa product exports', error);
        const message = error instanceof Error ? error.message : 'unknown data load error';
        setLoadError(message);
        track('app_error', { message: message.slice(0, 180), stage: 'data_load' });
      });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    const url = new URL(window.location.href);
    const publicRoute = parsePublicRoute(url.pathname);
    if (publicRoute) {
      url.pathname = url.pathname.replace(/^\/(en|ta)(?=\/|$)/, `/${locale}`);
      window.history.replaceState({}, '', url);
    } else {
      url.searchParams.set('lang', locale);
      window.history.replaceState({}, '', url);
    }
  }, [locale]);

  useEffect(() => {
    track('page_view', { route: initialRoute?.kind ?? 'explorer' });
    if (initialRoute && initialRoute.kind !== 'home') {
      track('route_open', { route: initialRoute.kind });
    }
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

  const saintById = useMemo(
    () => new Map((data?.saints ?? []).map((item) => [item.id, item])),
    [data],
  );

  const selectedSiteAllPatikams = useMemo(() => {
    if (!data) return [];
    const ids = new Set(
      data.edges
        .filter(
          (edge) =>
            edge.predicate === 'TEVARAM_PATIKAM_ASSOCIATED_WITH_SITE' &&
            edge.object === selectedSiteId,
        )
        .map((edge) => edge.subject),
    );
    return data.patikams
      .filter((item) => ids.has(item.id))
      .sort((a, b) => a.tirumurai - b.tirumurai || a.patikam - b.patikam);
  }, [data, selectedSiteId]);

  const selectedSiteSaintBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of selectedSiteAllPatikams) {
      counts.set(item.author_saint_id, (counts.get(item.author_saint_id) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([saintId, count]) => ({
        saintId,
        saint: saintById.get(saintId) ?? null,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [selectedSiteAllPatikams, saintById]);

  const selectedSiteTirumuraiBreakdown = useMemo(() => {
    const counts = new Map<number, number>();
    for (const item of selectedSiteAllPatikams) {
      counts.set(item.tirumurai, (counts.get(item.tirumurai) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0] - b[0]);
  }, [selectedSiteAllPatikams]);

  const periyaPuranamTitle = useMemo(() => {
    if (!data || selectedIsManikkavasakar) return '';
    const edge = data.edges.find(
      (item) =>
        item.predicate === 'EPISODE_ABOUT_SAINT' &&
        item.object === selectedSaintId,
    );
    const locator = edge?.evidence?.[0]?.locator ?? '';
    const parts = locator.split(';').map((item) => item.trim()).filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join(' · ') : '';
  }, [data, selectedIsManikkavasakar, selectedSaintId]);

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
          if (!locus.site_id) return null;
          const seed = GEO_SEEDS.find((item) => item.siteId === locus.site_id);
          if (!seed) return null;
          return {
            ...seed,
            name: locale === 'ta' ? (locus.label_ta || locus.display_name) : locus.display_name,
            playbackRank: locus.playback_rank,
            hymnIds: locus.section_numbers.map((section) => `tirumurai8.section.${section}`),
          };
        })
        .filter((item): item is MapStop => Boolean(item))
        .sort((a, b) => a.playbackRank - b.playbackRank);
    }

    return GEO_SEEDS
      .map((seed) => {
        const mappedSite = siteById.get(`tevaram_site.${seed.siteId}`);
        return {
          ...seed,
          name: mappedSite ? localizedSiteName(mappedSite, locale) : seed.name,
          hymnIds: siteLinks.get(`tevaram_site.${seed.siteId}`) ?? [],
        };
      })
      .filter((item) => item.hymnIds.length)
      .sort((a, b) => a.playbackRank - b.playbackRank);
  }, [locale, selectedIsManikkavasakar, siteById, siteLinks, tirumurai8]);

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
            ? tr(locale, 'Birthplace tradition')
            : edge.predicate === 'MUKTI_PLACE_TRADITION'
              ? tr(locale, 'Mukti-place tradition')
              : tr(locale, 'Related-place tradition');
        return [{
          id: `${edge.predicate}:${place.id}`,
          name: locale === 'ta' ? (place.label_ta || place.label) : place.label,
          detail,
          kind: 'traditional_place' as const,
        }];
      });
  }, [data, locale, selectedIsManikkavasakar, selectedSaintId, traditionalPlaceById]);

  const playbackStops = useMemo<PlaybackStop[]>(() => {
    if (routeStops.length >= 2) {
      return routeStops.map((stop) => ({
        id: `mapped:${stop.siteId}`,
        name: stop.name,
        detail: locale === 'ta'
          ? selectedIsManikkavasakar
            ? `${stop.hymnIds.length} திருவாசகப் பகுதிகள்`
            : `${stop.hymnIds.length} தேவாரப் பதிகங்கள்`
          : selectedIsManikkavasakar
            ? `${stop.hymnIds.length} Tiruvācakam section locus${stop.hymnIds.length === 1 ? '' : 'i'}`
            : `${stop.hymnIds.length} Tēvāram pathigam${stop.hymnIds.length === 1 ? '' : 's'}`,
        kind: 'exact_text_locus' as const,
        siteId: stop.siteId,
      }));
    }
    return traditionalPlaybackStops;
  }, [locale, routeStops, selectedIsManikkavasakar, traditionalPlaybackStops]);

  const playbackIsGeographic = routeStops.length >= 2;
  const playbackKind = locale === 'ta'
    ? selectedIsManikkavasakar
      ? 'திருமுறை 8 தலக் குறிப்புகள்'
      : playbackIsGeographic
        ? 'திருத்தலப் பயணம்'
        : 'மரபில் வரும் தலங்கள்'
    : selectedIsManikkavasakar
      ? 'Tirumurai 8 loci'
      : playbackIsGeographic
        ? 'Pilgrimage'
        : 'Traditional place';

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
      .slice(0, 12);
  }, [selectedIsManikkavasakar, siteById, siteLinks, tirumurai8]);

  const selectedSite = siteById.get(selectedSiteId) ?? null;
  const selectedPatikams = siteLinks.get(selectedSiteId) ?? [];
  const selectedTirumurai8Locus = tirumurai8LociBySite.get(selectedSiteId) ?? null;
  const uttarakosamangai = saivaPlaces?.places.find(
    (place) => place.id === 'saiva_place.tiru_uttarakosamangai',
  ) ?? null;
  const uttarakosamangaiLinks = (saivaPlaces?.links ?? [])
    .filter((link) => link.object === 'saiva_place.tiru_uttarakosamangai')
    .sort((a, b) => {
      const section = (link: SaivaLiteraryLink) =>
        Number(link.subject.match(/\.s(\d+)$/)?.[1] ?? 0);
      return section(a) - section(b);
    });
  const kolaruContext = (saivaPlaces?.links ?? []).find(
    (link) => link.id === 'literary-place.tevaram.2_85.kt125',
  ) ?? null;
  const sourceHeaderLoci = (tirumurai8?.loci ?? []).filter(
    (locus) => locus.locus_kind === 'source_header_composition_locus',
  );
  const unplottedTirumurai8Loci = (tirumurai8?.loci ?? []).filter(
    (locus) => !locus.site_id,
  );
  const selectedSiteKolaruContext =
    selectedSaintId === 'nayanmar.27' && selectedSiteId === 'tevaram_site.KT125'
      ? kolaruContext
      : null;

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

  const saintCuriosity = !selectedIsManikkavasakar
    ? curiosities?.stories.find((item) => item.saint_id === selectedSaintId) ?? null
    : null;

  const discoveryStories = useMemo(() => {
    const ids = ['nayanmar.09', 'nayanmar.23', 'nayanmar.17', 'nayanmar.56', 'nayanmar.27'];
    return ids.flatMap((id) => {
      const item = saintById.get(id);
      const story = curiosities?.stories.find((entry) => entry.saint_id === id);
      if (!item || !story) return [];
      return [{
        saint: item,
        name: localizedSaintName(item, locale),
        hook: locale === 'ta' ? story.hook_ta : story.hook_en,
      }];
    });
  }, [curiosities, locale, saintById]);

  const discoverySites = useMemo(() => {
    return (data?.sites ?? [])
      .slice()
      .sort((a, b) => b.patikam_count - a.patikam_count)
      .slice(0, 4)
      .map((site) => ({ site, name: localizedSiteName(site, locale) }));
  }, [data, locale]);

  const searchResults = useMemo(() => {
    if (!data || !query.trim()) {
      return {
        saints: [] as Saint[],
        stories: [] as Saint[],
        sites: [] as Site[],
        manikkavasakar: false,
      };
    }

    const normalize = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\u0B80-\u0BFF]+/g, ' ')
      .trim();
    const needle = normalize(query);

    const score = (values: Array<string | null | undefined>) => {
      let best = 0;
      for (const raw of values) {
        if (!raw) continue;
        const value = normalize(String(raw));
        if (value === needle) best = Math.max(best, 100);
        else if (value.startsWith(needle)) best = Math.max(best, 70);
        else if (value.includes(needle)) best = Math.max(best, 45);
        else if (needle.split(' ').every((token) => value.includes(token))) best = Math.max(best, 25);
      }
      return best;
    };

    const saints = data.saints
      .map((item) => ({
        item,
        score: score([SAINT_EN[item.id], item.label, item.label_ta, ...(item.aliases ?? [])]),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.item.ordinal - b.item.ordinal)
      .slice(0, 4)
      .map((entry) => entry.item);

    const storyBySaint = new Map((curiosities?.stories ?? []).map((item) => [item.saint_id, item]));
    const stories = data.saints
      .map((item) => {
        const story = storyBySaint.get(item.id);
        return {
          item,
          score: story ? score([story.hook_en, story.hook_ta]) : 0,
        };
      })
      .filter((entry) => entry.score > 0 && !saints.some((saintItem) => saintItem.id === entry.item.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((entry) => entry.item);

    const sites = data.sites
      .map((item) => ({
        item,
        score: score([
          item.label,
          item.label_ta,
          item.modern_name_nic,
          item.district,
          item.taluk,
          ...(item.aliases ?? []),
        ]),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.item.patikam_count - a.item.patikam_count)
      .slice(0, 6)
      .map((entry) => entry.item);

    const manikkavasakarTerms = [
      'manikkavasakar',
      'manikkavacakar',
      'மாணிக்கவாசகர்',
      'tiruvacakam',
      'thiruvachakam',
      'திருவாசகம்',
      'tirukkovaiyar',
      'திருக்கோவையார்',
      ...(tirumurai8?.loci ?? []).flatMap((locus) => [
        locus.display_name,
        locus.label_ta,
        ...locus.section_titles_ta,
        locus.source_note_ta,
      ]),
      ...(saivaPlaces?.places ?? []).flatMap((place) => [
        place.label,
        place.label_ta,
        ...(place.aliases ?? []),
      ]),
      ...(saivaPlaces?.links ?? []).flatMap((link) => [
        link.source_note_ta,
        link.source_header_composition_place_ta,
        link.source_form_ta,
        link.normalized_place_ta,
        link.traditional_place_ta,
      ]),
    ];
    const manikkavasakar = score(manikkavasakarTerms) > 0;

    return { saints, stories, sites, manikkavasakar };
  }, [curiosities, data, query, saivaPlaces, tirumurai8]);

  useEffect(() => {
    setProgress(0);
    setPlaying(false);
    if (didInitSaintSelection.current) {
      setTab('visits');
      track('saint_selected', { saint: selectedSaintId });
    } else {
      didInitSaintSelection.current = true;
    }
  }, [selectedSaintId]);

  useEffect(() => {
    if (!data) return;
    const selected = data.sites.find((item) => item.id === selectedSiteId);
    if (selected) track('site_selected', { site: selected.site_id });
  }, [data, selectedSiteId]);

  useEffect(() => {
    if (!selectedIsManikkavasakar || !tirumurai8?.loci.length) return;
    setSelectedSiteId(tirumurai8.loci[0].site_entity_id);
    if (preserveInitialTabDeepLink.current) {
      preserveInitialTabDeepLink.current = false;
      return;
    }
    setTab('visits');
  }, [selectedIsManikkavasakar, tirumurai8]);

  useEffect(() => {
    if (!playbackIsGeographic || !routeStops.length) return;
    if (preserveInitialSiteDeepLink.current) {
      preserveInitialSiteDeepLink.current = false;
      return;
    }
    const active = routeStops[Math.min(progress, routeStops.length - 1)];
    if (!active) return;
    setSelectedSiteId(`tevaram_site.${active.siteId}`);
  }, [playbackIsGeographic, progress, routeStops, selectedSaintId]);

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

  if (loadError) {
    return (
      <main className="fatal-error">
        <div>
          <h1>Nayanmar Trails</h1>
          <p>{locale === 'ta' ? 'தரவை இப்போது திறக்க முடியவில்லை.' : 'The evidence data could not be loaded just now.'}</p>
          <button onClick={() => window.location.reload()}>{locale === 'ta' ? 'மீண்டும் முயற்சி செய்' : 'Try again'}</button>
        </div>
      </main>
    );
  }

  if (!data || !tirumurai8 || !saivaPlaces || !curiosities) {
    return (
      <div className="loading">
        <div className="loading-mark"><GopuramIcon /></div>
        <div>{tr(locale, 'Opening Nayanmar Trails…')}</div>
      </div>
    );
  }

  const saintName = selectedIsManikkavasakar
    ? locale === 'ta' ? tirumurai8.author.label_ta : tirumurai8.author.display_label
    : localizedSaintName(saint, locale);
  const saintRegistryLabel = selectedIsManikkavasakar
    ? tr(locale, 'NAALVAR · TIRUMURAI 8')
    : locale === 'ta'
      ? `அறுபத்து மூவரில் ${saint?.ordinal ?? ''}`
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
  const showTraditionalDetail = !selectedIsManikkavasakar && !playbackIsGeographic;

  return (
    <LocaleContext.Provider value={locale}>
    <main className="app" data-locale={locale}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><GopuramIcon /></span>
          <div>
            <strong>Nayanmar Trails</strong>
            <small><T>DEVOTION CONNECTS LANDS</T></small>
          </div>
        </div>

        <nav>
          <button className="active"><T>Explore</T></button>
          <button
            className="quest-nav-button"
            onClick={() => setQuestOpen(true)}
          >
            {locale === 'ta' ? 'தேடல்' : 'Quest'}
          </button>
          <button onClick={() => document.querySelector('.timeline')?.scrollIntoView({ behavior: 'smooth' })}><T>Journeys</T></button>
          <button onClick={() => setTab('visits')}><T>Sthalams</T></button>
          <button onClick={() => setTab('hymns')}><T>Tēvāram</T></button>
          <button
            onClick={() => {
              if (showTraditionalDetail) {
                document.querySelector('.timeline')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                setGraphOpen(true);
              }
            }}
            title={tr(locale, showTraditionalDetail ? 'Explore the traditional-place sequence below' : 'Open sthalam connections')}
          >
            <T>Connections</T>
          </button>
          <button onClick={() => {
            setSourcesOpen(true);
            track('sources_open', { source: 'top_nav' });
          }}><T>Sources</T></button>
        </nav>

        <div className="language-switcher" aria-label={tr(locale, 'Language')}>
          <button
            className={locale === 'en' ? 'active' : ''}
            onClick={() => setLocale('en')}
            aria-pressed={locale === 'en'}
          >
            EN
          </button>
          <button
            className={locale === 'ta' ? 'active' : ''}
            onClick={() => setLocale('ta')}
            aria-pressed={locale === 'ta'}
          >
            தமிழ்
          </button>
        </div>

        <div className="header-search">
          <span className="search-glyph">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === 'ta'
              ? 'நாயன்மார், பாடல்கள், திருத்தலங்கள், தலங்கள் தேடுங்கள்…'
              : 'Search saints, hymns, sthalams, or places…'}
          />
          {query && (
            <div className="search-results">
              {searchResults.saints.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedSaintId(item.id);
                    setQuery('');
                    track('search_select', { kind: 'saint', saint: item.id });
                  }}
                >
                  <GopuramIcon />
                  <span>
                    {localizedSaintName(item, locale)}
                    <small>{locale === 'ta' ? `அறுபத்து மூவரில் ${item.ordinal}` : `Nayanmar ${item.ordinal}`}</small>
                  </span>
                </button>
              ))}
              {searchResults.manikkavasakar && (
                <button
                  onClick={() => {
                    setSelectedSaintId(MANIKKAVASAKAR_ID);
                    setQuery('');
                    track('search_select', { kind: 'saint', saint: MANIKKAVASAKAR_ID });
                  }}
                >
                  <GopuramIcon />
                  <span>
                    {locale === 'ta' ? tirumurai8.author.label_ta : 'Manikkavasakar'}
                    <small>
                      {locale === 'ta'
                        ? 'நால்வர் · திருமுறை 8 · பாடல்கள் மற்றும் தலக் குறிப்புகள்'
                        : 'Naalvar · Tirumurai 8 · works & textual loci'}
                    </small>
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
                    track('search_select', { kind: 'sthalam', site: item.site_id });
                  }}
                >
                  <GopuramIcon />
                  <span>
                    {localizedSiteName(item, locale)}
                    <small>{locale === 'ta' ? (localizedAdministrativeName(item.district, locale) || item.site_id) : `${cleanLabel(item.label)} · ${item.district || item.site_id}`}</small>
                  </span>
                </button>
              ))}
              {searchResults.stories.map((item) => {
                const story = curiosities?.stories.find((entry) => entry.saint_id === item.id);
                return (
                  <button
                    key={`story:${item.id}`}
                    onClick={() => {
                      setSelectedSaintId(item.id);
                      setStoryOpen(true);
                      setQuery('');
                      track('search_select', { kind: 'story', saint: item.id });
                    }}
                  >
                    <span className="search-story-glyph">✦</span>
                    <span>
                      {localizedSaintName(item, locale)}
                      <small>{locale === 'ta' ? 'கதையில் பொருந்தியது' : 'Matched in the story'}{story ? ' · Periya Puranam' : ''}</small>
                    </span>
                  </button>
                );
              })}
              {!searchResults.saints.length && !searchResults.stories.length && !searchResults.sites.length && !searchResults.manikkavasakar && (
                <em>{tr(locale, 'No matching saint or sthalam')}</em>
              )}
            </div>
          )}
        </div>

        <div className="header-motto">
          {locale === 'ta' ? <>பழம்பாதைகள்<br /><b>இன்றும் வாழும் மரபு</b></> : <>Ancient Paths<br /><b>Living Today</b></>}
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
          <span><T>ANCIENT PATHS · LIVING DEVOTION</T></span>
          <h1>
          {locale === 'ta'
            ? tr(locale, 'Follow the Nayanmars across sacred Tamil Nadu')
            : <>Follow the Nayanmars <br className="hero-mobile-break" />across sacred Tamil Nadu</>}
        </h1>
          <p>{tr(locale, 'Explore sthalams, Tēvāram pathigams, saint traditions and the sacred geography that connects them.')}</p>
        </div>
        <blockquote className="hero-quote">
          {locale === 'ta'
            ? <>“இது பழைய வரலாறு மட்டும் அல்ல;<br />இன்றும் வாழும் பக்தியின் பாதை.”</>
            : <>“Not just history,<br />but a living landscape of devotion.”</>}
        </blockquote>
        <div className="hero-tower right"><GopuramIcon /></div>
        <small className="hero-credit">{HERO_MEDIA.source} · {HERO_MEDIA.license}</small>
      </section>

      {showStartHere && (
        <QuestInvitation
          locale={locale}
          onOpen={() => setQuestOpen(true)}
        />
      )}

      {showStartHere && (
        <StartHere
          locale={locale}
          stories={discoveryStories}
          sites={discoverySites}
          onSaint={(item) => {
            setSelectedSaintId(item.id);
            requestAnimationFrame(() => document.querySelector('.saint-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
          }}
          onStory={(item) => {
            setSelectedSaintId(item.id);
            setStoryOpen(true);
          }}
          onSite={(site) => {
            setSelectedSiteId(site.id);
            setTab('visits');
            requestAnimationFrame(() => document.querySelector('.detail-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
          }}
          onTrail={() => {
            setSelectedSaintId('nayanmar.20');
            requestAnimationFrame(() => document.querySelector('.map-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
          }}
        />
      )}

      <section className="filters">
        <Filter label={tr(locale, 'Saint')}>
          <select
            value={selectedSaintId}
            onChange={(event) => {
              setSelectedSaintId(event.target.value);
              setGraphOpen(false);
            }}
          >
            <optgroup label={tr(locale, 'Naalvar')}>
              <option value="nayanmar.20">{localizedSaintName(saintById.get('nayanmar.20') ?? null, locale)}</option>
              <option value="nayanmar.27">{localizedSaintName(saintById.get('nayanmar.27') ?? null, locale)}</option>
              <option value="nayanmar.63">{localizedSaintName(saintById.get('nayanmar.63') ?? null, locale)}</option>
              <option value={MANIKKAVASAKAR_ID}>{locale === 'ta' ? tirumurai8.author.label_ta : 'Manikkavasakar · Tirumurai 8'}</option>
            </optgroup>
            <optgroup label={tr(locale, '63 Nayanmar registry')}>
              {data.saints.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.ordinal}. {localizedSaintName(item, locale)}
                </option>
              ))}
            </optgroup>
          </select>
        </Filter>

        <div className="naalvar-switcher" aria-label="Naalvar quick selection">
          <span><T>Naalvar</T></span>
          {NAALVAR.map((id) => (
            <button
              key={id}
              className={selectedSaintId === id ? 'active' : ''}
              onClick={() => {
                setSelectedSaintId(id);
                setGraphOpen(false);
              }}
            >
              {id === MANIKKAVASAKAR_ID
                ? (locale === 'ta' ? tirumurai8.author.label_ta : 'Manikkavasakar')
                : localizedSaintName(saintById.get(id) ?? null, locale).split(' · ')[0]}
            </button>
          ))}
        </div>

        <div className="mode-pills" aria-label="Map view">
          <span className="mode-label"><T>View</T></span>
          {(Object.keys(MODE_COPY) as EvidenceMode[]).map((item) => (
            <button
              key={item}
              className={mode === item ? 'active' : ''}
              onClick={() => setMode(item)}
            >
              {tr(locale, MODE_COPY[item].label)}
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
            <div>
              <small>{saintRegistryLabel}</small>
              <h2>{saintName}</h2>
            </div>
            {saint && !selectedIsManikkavasakar && (
              <SaintShare
                locale={locale}
                saint={saint}
                englishName={SAINT_EN[saint.id] ?? saint.label}
                displayName={saintName}
              />
            )}
            {selectedIsManikkavasakar && (
              <ShareButton
                label={locale === 'ta' ? 'இந்தப் பக்கத்தைப் பகிர்' : 'Share page'}
                title={saintName}
                path={companionPath(locale)}
                kind="saint"
              />
            )}
          </div>

          <div className="identity-line">
            <GopuramIcon />
            {tr(locale, selectedIsManikkavasakar
              ? 'Naalvar · Tirumurai 8 companion'
              : '63-Nayanmar traditional identity')}
          </div>

          <div className="saint-story-source">
            <small>{selectedIsManikkavasakar ? tr(locale, 'DEVOTIONAL WORKS') : tr(locale, 'STORY TRADITION')}</small>
            <b>
              {selectedIsManikkavasakar
                ? (locale === 'ta' ? 'திருவாசகம் · திருக்கோவையார்' : 'Tiruvācakam · Tirukkōvaiyār')
                : (locale === 'ta' ? (periyaPuranamTitle || tr(locale, 'Periya Puranam tradition')) : 'Periya Puranam tradition')}
            </b>
          </div>

          {saintCuriosity && (
            <div className="saint-curiosity">
              <div className="saint-curiosity-head">
                <small>{tr(locale, 'WHY THIS NAYANMAR IS REMEMBERED')}</small>
                <span>{tr(locale, 'A story from tradition')}</span>
              </div>
              <p>{locale === 'ta' ? saintCuriosity.hook_ta : saintCuriosity.hook_en}</p>
              <div className="saint-curiosity-source">
                <b>{locale === 'ta' ? (periyaPuranamTitle || tr(locale, 'Periya Puranam tradition')) : 'Periya Puranam tradition'}</b>
                <small>{tr(locale, 'Traditional narrative — not presented as independently verified biography.')}</small>
              </div>
              <div className="saint-curiosity-actions">
                <button onClick={() => {
                  setStoryOpen(true);
                  track('story_open', { saint: selectedSaintId, source: 'card' });
                }}>
                  {locale === 'ta' ? 'கதையை முழுமையாக வாசிக்க' : 'Read the story'} →
                </button>
                <button onClick={() => {
                  setSourcesOpen(true);
                  track('sources_open', { source: 'story_card' });
                }}>
                  {tr(locale, 'Read the source trail')} →
                </button>
              </div>
            </div>
          )}

          <div className="stat-grid">
            {selectedIsManikkavasakar ? (
              <>
                <Stat value={tirumurai8.works.tiruvacakam.sections} label={tr(locale, 'Tiruvācakam sections')} />
                <Stat value={tirumurai8.works.tiruvacakam.source_units} label={tr(locale, 'source units')} />
                <Stat value={tirumurai8.works.tirukkovaiyar.source_order_units} label={tr(locale, 'Tirukkōvaiyār units')} />
                <Stat value={routeStops.length} label={tr(locale, 'mapped textual loci')} />
              </>
            ) : (
              <>
                <Stat value={authoredPatikams.length} label={tr(locale, 'Tēvāram pathigams')} />
                <Stat value={siteLinks.size} label={tr(locale, 'sung sthalams')} />
                <Stat value={episodeCount} label={tr(locale, 'Periya Puranam chapter')} />
                <Stat value={playbackStops.length} label={tr(locale, 'journey stops')} />
              </>
            )}
          </div>

          <div className="major-temples">
            <div className="section-title">
              <h3>
                {tr(locale, showTraditionalDetail
                  ? 'Traditional place claims'
                  : selectedIsManikkavasakar
                    ? 'Tirumurai 8 textual loci'
                    : 'Major sthalams')}
              </h3>
              <span>
                {showTraditionalDetail
                  ? traditionalPlaybackStops.length
                  : selectedIsManikkavasakar
                    ? tirumurai8.loci.length
                    : siteLinks.size} {tr(locale, 'total')}
              </span>
            </div>
            {showTraditionalDetail ? (
              traditionalPlaybackStops.slice(0, 6).map((stop, index) => (
                <button
                  key={stop.id}
                  className={index === progress ? 'active-tradition-place' : ''}
                  onClick={() => {
                    setProgress(index);
                    setTab('visits');
                  }}
                >
                  <i className="tradition-place-dot" />
                  <span className="major-talam-copy">
                    <b>{stop.name}</b>
                    <em>{stop.detail}</em>
                  </span>
                  <small>{index + 1}</small>
                </button>
              ))
            ) : (
              topLinkedSites.slice(0, 6).map(({ site, count }) => {
                const primary = localizedSiteName(site, locale);
                const canonical = cleanLabel(site.label);
                return (
                  <button
                    key={site.id}
                    onClick={() => {
                      setSelectedSiteId(site.id);
                      setTab('visits');
                    }}
                  >
                    <GopuramIcon />
                    <span className="major-talam-copy">
                      <b>{primary}</b>
                      {locale === 'en' && canonical.toLowerCase() !== primary.toLowerCase() && <em>{canonical}</em>}
                    </span>
                    <small>{count}</small>
                  </button>
                );
              })
            )}
          </div>

          {selectedIsManikkavasakar && sourceHeaderLoci.length > 0 && (
            <div className="authority-box">
              <b>{locale === 'ta' ? 'மூலத் தலைப்பில் நேரடியாகக் கூறப்படும் இரண்டு தலங்கள்' : 'Two explicit source-header composition loci'}</b>
              <p>
                {locale === 'ta'
                  ? 'நிலைப்படுத்தப்பட்ட Project Madurai பதிப்பின் தலைப்புகள் திருவெம்பாவையை திருவண்ணாமலையுடனும், திருப்பள்ளியெழுச்சியை திருப்பெருந்துறையுடனும் தனித்தனியாக இணைக்கின்றன. இது பதிப்பு/மூலத் தகவல்; தனித்த வரலாற்றுச் சான்று அல்ல.'
                  : 'The pinned Project Madurai headings separately place Tiruvempavai at Tiruvannamalai and Tiruppalliyezhuchi at Tirupperunturai. This is edition/source metadata, not independent historical verification.'}
              </p>
              <div className="literary-section-grid">
                {sourceHeaderLoci.map((locus) => (
                  <span key={locus.id} className="composition">
                    <b>{locus.section_numbers[0]}</b>
                    {locale === 'ta'
                      ? `${locus.section_titles_ta[0]} · ${locus.label_ta || locus.display_name}`
                      : `${locus.section_titles_ta[0]} · ${locus.display_name}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedIsManikkavasakar && uttarakosamangai && (
            <LiterarySthalamHighlight
              place={uttarakosamangai}
              links={uttarakosamangaiLinks}
              onExplore={() => setTab('chronology')}
            />
          )}

          <div className="journey-progress">
            <div>
              <b><T>Playback progress</T></b>
              <span>{playbackStops.length ? Math.min(progress + 1, playbackStops.length) : 0} / {playbackStops.length}</span>
            </div>
            <div className="mini-track"><i style={{ width: `${progressPct}%` }} /></div>
          </div>

          <div className="authority-box">
            <b>
              {selectedIsManikkavasakar
                ? locale === 'ta' ? 'இந்தத் தல வரிசையை எப்படி வாசிப்பது?' : 'How to read this journey'
                : tr(locale, MODE_COPY[mode].short)}
            </b>
            <p>
              {selectedIsManikkavasakar
                ? locale === 'ta'
                  ? 'வரைபடத்தில் காட்டப்படும் திருமுறை 8 தலங்கள் பாடல் உரையில் வரும் இடங்கள். அவற்றை இணைக்கும் கோடு வாசிப்புக்கு உதவும் காட்சி மட்டுமே; மாணிக்கவாசகரின் வரலாற்றுப் பயணப் பாதை என்று கொள்ளக்கூடாது.'
                  : 'The plotted Tirumurai 8 locations are textual-locus waypoints. The line between them is a visual guide, not a claimed historical itinerary.'
                : tr(locale, MODE_COPY[mode].body)}
            </p>
          </div>
        </aside>

        <section className="panel map-card">
          <div className="map-toolbar">
            <div className="map-toolbar-left">
              <GopuramIcon />
              <span>{saintName.split(' · ')[0]} · {selectedIsManikkavasakar ? tr(locale, 'Tirumurai 8') : tr(locale, MODE_COPY[mode].short)}</span>
            </div>
            <div className="map-toolbar-stats">
              <span>
                <b>{selectedIsManikkavasakar ? tirumurai8.loci.length : playbackIsGeographic ? siteLinks.size : traditionalPlaybackStops.length}</b>
                {' '}{tr(locale, selectedIsManikkavasakar ? 'textual loci' : playbackIsGeographic ? 'linked sthalams' : 'traditional places')}
              </span>
              <span><b>{saintDistrictCoverage.length}</b><T>mapped districts</T></span>
              <span><b>{routeStops.length}</b><T>mapped sthalams</T></span>
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
            showUnlinkedExemplars={false}
            onSelect={(siteId) => {
              setSelectedSiteId(siteId);
              setTab('visits');
              track('map_interaction', { action: 'select_sthalam', site: siteId.replace('tevaram_site.', '') });
            }}
          />

          <div className="map-legend">
            <b><T>Map legend</T></b>
            <span><i className="legend-tower"><GopuramIcon /></i><T>mapped sthalam location (modern centroid)</T></span>
            {playbackIsGeographic ? (
              <span><i className="legend-route" /><T>reconstructed line between known Tēvāram-linked sthalams</T></span>
            ) : (
              <span><i className="legend-tradition" /><T>traditional place sequence plays below without invented coordinates</T></span>
            )}
            <span><i className="legend-coverage" /><T>selected-saint sthalam density by modern district</T></span>
            <span><i className="legend-independent" /><T>independent inscriptional support</T></span>
          </div>

          <div className="map-source-note">
            {locale === 'ta'
              ? 'OpenFreeMap / OpenStreetMap வரைபடம் · தொகுக்கப்பட்ட பாரம்பரியத் தரவுகள்'
              : 'OpenFreeMap / OpenStreetMap basemap · curated heritage data'}
          </div>

          {!playbackIsGeographic && traditionalPlaybackStops.length > 0 && (
            <div className="map-fallback-note">
              <Badge kind="tradition"><T>TRADITION PLAYBACK</T></Badge>
              <b>
                {locale === 'ta'
                  ? `${saintName} பற்றிய மரபில் ${traditionalPlaybackStops.length} தலங்கள் சொல்லப்படுகின்றன`
                  : `${traditionalPlaybackStops.length} traditional places are associated with ${saintName}`}
              </b>
              <p>
                {locale === 'ta'
                  ? 'அந்தத் தலங்களை கீழே ஒன்றன்பின் ஒன்றாகப் பாருங்கள். இருப்பிடம் உறுதியாகத் தெரியாத வரை பாதையை ஊகித்து வரைபடத்தில் காட்டமாட்டோம்.'
                  : 'Use the journey strip below to explore them. A geographic route is not drawn until reviewed locations are available.'}
              </p>
            </div>
          )}

        </section>

        <aside className="panel detail-card">
          <div className={`tabs ${showTraditionalDetail ? 'three-tabs' : ''}`}>
            {showTraditionalDetail ? (
              (['visits', 'chronology', 'evidence'] as DetailTab[]).map((item) => (
                <button
                  key={item}
                  className={tab === item ? 'active' : ''}
                  onClick={() => setTab(item)}
                >
                  {tr(locale, item === 'visits'
                    ? 'Tradition'
                    : item === 'chronology'
                      ? 'Journey'
                      : 'Sources')}
                </button>
              ))
            ) : (
              (['hymns', 'chronology', 'visits', 'evidence'] as DetailTab[]).map((item) => (
                <button
                  key={item}
                  className={tab === item ? 'active' : ''}
                  onClick={() => setTab(item)}
                >
                  {tr(locale, item === 'visits'
                    ? selectedIsManikkavasakar ? 'Sthalams' : 'Overview'
                    : item === 'hymns'
                      ? selectedIsManikkavasakar ? 'Tirumurai 8' : 'Tēvāram'
                      : item === 'chronology'
                        ? 'Journey'
                        : 'Sources')}
                </button>
              ))
            )}
          </div>

          <div className="detail">
            {showTraditionalDetail ? (
              <TraditionalPlaceDetail
                saintName={saintName}
                stop={activePlaybackStop}
                total={traditionalPlaybackStops.length}
                tab={tab}
              />
            ) : (
              <>
                <div className={`temple-visual ${templeMedia ? 'has-photo' : ''}`}>
                  {templeMedia ? (
                    <img src={templeMedia.src} alt="" />
                  ) : (
                    <div className="temple-art"><GopuramIcon /></div>
                  )}
                  <div className="temple-shade" />
                  <div className="temple-title">
                    <small><T>CURRENT STHALAM</T></small>
                    <h2>{selectedSite ? localizedSiteName(selectedSite, locale) : (locale === 'ta' ? 'ஒரு திருத்தலத்தைத் தேர்ந்தெடுக்கவும்' : 'Select a sthalam')}</h2>
                    <p>{selectedSite && locale === 'en' ? cleanLabel(selectedSite.label) : ''}</p>
                  </div>
                  {templeMedia && (
                    <span className="temple-credit">{templeMedia.source} · {templeMedia.license}</span>
                  )}
                </div>

                {selectedSite && (
                  <>
                    <div className="chips">
                      <span>{selectedSite.site_id}</span>
                      <span>
                        {locale === 'ta'
                          ? `${selectedSite.patikam_count} தேவாரப் பதிகங்கள்`
                          : `${selectedSite.patikam_count} Tēvāram pathigams`}
                      </span>
                      {selectedIsManikkavasakar ? (
                        <span>
                          {selectedTirumurai8Locus
                            ? locale === 'ta'
                              ? `${selectedTirumurai8Locus.section_numbers.length} திருவாசகப் பகுதிகள்`
                              : `${selectedTirumurai8Locus.section_numbers.length} Tiruvācakam section ${selectedTirumurai8Locus.section_numbers.length === 1 ? 'locus' : 'loci'}`
                            : locale === 'ta' ? 'திருமுறை 8 பாடல் குறிப்பு இல்லை' : 'no mapped Tirumurai 8 locus'}
                        </span>
                      ) : (
                        <span>
                          {locale === 'ta'
                            ? `${saintName.split(' · ')[0]} பாடியவை ${selectedPatikams.length}`
                            : `${selectedPatikams.length} by ${saintName.split(' · ')[0]}`}
                        </span>
                      )}
                    </div>

                    <div className="site-share-row">
                      <SiteShare
                        locale={locale}
                        site={selectedSite}
                        displayName={localizedSiteName(selectedSite, locale)}
                      />
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
                          <Tirumurai8Chronology
                            snapshot={tirumurai8}
                            place={uttarakosamangai}
                            links={uttarakosamangaiLinks}
                          />
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
                          <SthalamOverview
                            site={selectedSite}
                            saintName={saintName}
                            selectedCount={selectedPatikams.length}
                            totalPathigams={selectedSiteAllPatikams.length}
                            saintBreakdown={selectedSiteSaintBreakdown}
                            tirumuraiBreakdown={selectedSiteTirumuraiBreakdown}
                            contextualHymn={selectedSiteKolaruContext}
                          />
                        )}
                        {tab === 'hymns' && (
                          <ThevaramDetails
                            items={selectedSiteAllPatikams}
                            saintById={saintById}
                            selectedSaintId={selectedSaintId}
                          />
                        )}
                        {tab === 'chronology' && (
                          <JourneyContext
                            saintName={saintName}
                            stops={playbackStops}
                            activeIndex={progress}
                            geographic={playbackIsGeographic}
                          />
                        )}
                        {tab === 'evidence' && <SourceDetails site={selectedSite} data={data} />}
                      </>
                    )}

                    <div className="temple-facts">
                      <Fact
                        label={locale === 'ta' ? 'திருத்தலப் பகுதி' : 'Sacred region'}
                        value={locale === 'ta'
                          ? localizedSacredRegion(selectedSite.traditional_location_class, locale) || 'தகவல் தரப்படவில்லை'
                          : selectedSite.traditional_location_class || 'Not supplied'}
                      />
                      <Fact
                        label={locale === 'ta' ? 'இன்றைய இருப்பிடம்' : 'Modern location'}
                        value={locale === 'ta'
                          ? localizedAdministrativeName(selectedSite.district, locale) || localizedSiteName(selectedSite, locale)
                          : selectedSite.modern_name_nic || selectedSite.district || 'Not supplied'}
                      />
                      <Fact
                        label={locale === 'ta' ? 'வரைபட நிலை' : 'Map location'}
                        value={locale === 'ta'
                          ? selectedGeoSeed ? 'இன்றைய ஊர் மையம் வரைபடத்தில் குறிக்கப்பட்டுள்ளது' : 'மாவட்ட அளவிலான தகவல் மட்டும்'
                          : selectedGeoSeed ? 'Mapped modern centroid' : 'District-level context'}
                      />
                      <Fact
                        label={locale === 'ta' ? 'ஆதார வகை' : 'Source layer'}
                        value={
                          selectedIsManikkavasakar
                            ? selectedTirumurai8Locus
                              ? locale === 'ta' ? 'திருமுறை 8 பாடல் குறிப்பு' : 'Tirumurai 8 textual locus'
                              : locale === 'ta' ? 'திருமுறை 8 பாடல் குறிப்பு இல்லை' : 'No mapped Tirumurai 8 locus'
                            : authorityLabel(selectedSite.authority_scope, locale)
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
                      <GopuramIcon /> {locale === 'ta' ? 'வரைபடத்தில் காண்க' : 'Locate on map'} →
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </aside>
      </section>

      <section className="bottom">
        <div className="panel timeline">
          <div className="section-head">
            <div>
              <h3>{locale === 'ta' ? playbackKind : `${playbackKind} playback`}</h3>
              <p>
                {selectedIsManikkavasakar ? (
                  locale === 'ta' ? (
                    <>
                      வரைபடத்தில் உறுதிப்படுத்தப்பட்ட திருமுறை 8 தலக் குறிப்புகளை வாசிப்பு வரிசையில் பார்க்கலாம்.
                      <b>திருப்பெருந்துறை மூலத் தலைப்பில் தெளிவாக வந்தாலும், பரிசீலிக்கப்பட்ட வரைபட இடம் இல்லாததால் இப்போது புள்ளியாக காட்டப்படவில்லை. இந்த இணைப்புக் கோடு வரலாற்றுப் பயண வரிசை அல்ல.</b>
                    </>
                  ) : (
                    <>
                      Follow the mapped Tirumurai 8 textual loci in a reading sequence.
                      <b>Tirupperunturai is explicit in the source heading but intentionally remains unplotted until reviewed product geometry exists. The line is not a historical itinerary.</b>
                    </>
                  )
                ) : playbackIsGeographic
                  ? <><T>Follow the selected sthalams in an exploratory sequence.</T><b><T>The line is not a claimed ancient road.</T></b></>
                  : <><T>Explore birthplace, related-place and mukti-place traditions.</T><b><T>No route is invented between them.</T></b></>}
              </p>
            </div>
            <Badge kind={selectedIsManikkavasakar ? 'edition' : playbackIsGeographic ? 'inference' : 'tradition'}>
              {locale === 'ta'
                ? selectedIsManikkavasakar ? 'உரைத் தலக் குறிப்புகள்' : playbackIsGeographic ? 'வழிகாட்டுக் காட்சி' : 'மரபு'
                : selectedIsManikkavasakar ? 'TEXT LOCI' : playbackIsGeographic ? 'PRESENTATION' : 'TRADITION'}
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
                  <b><T>No journey stops yet</T></b>
                  <small><T>No mapped sthalams or traditional place references are available for this selection.</T></small>
                </>
              )}
            </div>
          </div>

          <div className="timeline-labels">
            {playbackStops.slice(0, 6).map((stop) => (
              <span key={stop.id}>{stop.name}</span>
            ))}
          </div>

          {selectedIsManikkavasakar && unplottedTirumurai8Loci.length > 0 && (
            <div className="unplotted-loci-note">
              <span className="unplotted-loci-dot" />
              <div>
                <b>{locale === 'ta' ? 'வரைபடத்தில் இன்னும் புள்ளியாக்கப்படாத மூலத் தலக் குறிப்பு' : 'Explicit source locus not yet plotted'}</b>
                {unplottedTirumurai8Loci.map((locus) => (
                  <small key={locus.id}>
                    {locale === 'ta'
                      ? `${locus.section_titles_ta[0]} · ${locus.label_ta || locus.display_name}`
                      : `${locus.section_titles_ta[0]} · ${locus.display_name}`}
                  </small>
                ))}
              </div>
            </div>
          )}

          <div className="saint-registry">
            <div className="registry-copy">
              <b><T>Naalvar + 63-saint registry</T></b>
              <small><T>Manikkavasakar is Naalvar, not a 64th Nayanmar</T></small>
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
                      ? locale === 'ta' ? tirumurai8.author.label_ta : 'Manikkavasakar'
                      : localizedSaintName(saintById.get(id) ?? null, locale).split(' · ')[0]}
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
                      title={localizedSaintName(item, locale)}
                      className={item.id === selectedSaintId ? 'selected' : ''}
                      onClick={() => setSelectedSaintId(item.id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>

        {showTraditionalDetail ? (
          <div className="panel tradition-mini">
            <div className="section-title">
              <div>
                <h3><T>Traditional Place Claims</T></h3>
                <span>
                  {locale === 'ta'
                    ? `${traditionalPlaybackStops.length} மரபுத் தலங்கள்`
                    : `${traditionalPlaybackStops.length} traditional references`}
                </span>
              </div>
              <Badge kind="tradition"><T>TRADITION</T></Badge>
            </div>
            <div className="tradition-mini-list">
              {traditionalPlaybackStops.slice(0, 4).map((stop, index) => (
                <button
                  key={stop.id}
                  className={index === progress ? 'active' : ''}
                  onClick={() => {
                    setProgress(index);
                    setTab('visits');
                  }}
                >
                  <span>{index + 1}</span>
                  <div>
                    <b>{stop.name}</b>
                    <small>{stop.detail}</small>
                  </div>
                </button>
              ))}
            </div>
            <p><T>Shown as claims, not coordinates or a reconstructed road.</T></p>
          </div>
        ) : (
          <div className="panel graph-mini">
            <div className="section-title">
              <div>
                <h3>
                  {locale === 'ta'
                    ? selectedIsManikkavasakar ? 'திருமுறை 8 · தலத் தொடர்புகள்' : 'நாயன்மார் · திருத்தலத் தொடர்புகள்'
                    : selectedIsManikkavasakar ? 'Tirumurai 8 – Sthalam Connections' : 'Saint – Sthalam Connections'}
                </h3>
                <span>
                  {locale === 'ta'
                    ? selectedIsManikkavasakar
                      ? `${routeStops.length} வரைபடத் தலங்கள் · ${unplottedTirumurai8Loci.length} வரைபடமிடாத மூலத் தலம்`
                      : `${siteLinks.size} தொடர்புள்ள திருத்தலங்கள்`
                    : selectedIsManikkavasakar
                      ? `${routeStops.length} mapped loci · ${unplottedTirumurai8Loci.length} unplotted source locus`
                      : `${siteLinks.size} linked sthalams`}
                </span>
              </div>
              <button className="graph-expand" onClick={() => setGraphOpen(true)}><T>Expand ↗</T></button>
            </div>
            <button
              className="graph-preview-button"
              onClick={() => setGraphOpen(true)}
              aria-label={locale === 'ta' ? 'தலத் தொடர்பு வரைபடத்தை விரிவாகத் திற' : 'Open expanded connection graph'}
            >
              <Network
                saint={saint}
                centerLabel={selectedIsManikkavasakar ? (locale === 'ta' ? 'மா' : 'M') : undefined}
                sites={topLinkedSites.slice(0, 8)}
              />
            </button>
            {selectedIsManikkavasakar && unplottedTirumurai8Loci.length > 0 && (
              <div className="graph-unplotted-chip">
                <span>◇</span>
                {locale === 'ta'
                  ? 'திருப்பள்ளியெழுச்சி · திருப்பெருந்துறை — மூலத் தலக் குறிப்பு; வரைபட இடம் இன்னும் பரிசீலனையில்'
                  : 'Tiruppalliyezhuchi · Tirupperunturai — source-header locus; map geometry not yet curated'}
              </div>
            )}
          </div>
        )}

        <div className="panel density-card">
          <div className="section-title">
            <h3><T>Sthalam Density</T></h3>
            <span><T>276 Tēvāram sthalams</T></span>
          </div>
          <DensityPanel points={districtCoverage.slice(0, 6)} />
        </div>

        <div className="panel totals">
          <Stat value={data.meta.counts.saints} label={locale === 'ta' ? 'நாயன்மார்கள்' : 'Nayanmars'} />
          <Stat value={4} label={locale === 'ta' ? 'நால்வர்' : 'Naalvar'} />
          <Stat value={data.meta.counts.tevaram_patikams} label={tr(locale, 'Tēvāram pathigams')} />
          <Stat value={data.meta.counts.tevaram_sites} label={locale === 'ta' ? 'திருத்தலங்கள்' : 'Sthalams'} />
        </div>
      </section>

      <QuestMode
        locale={locale}
        open={questOpen}
        initialQuestKey={questInitialKey}
        initialStep={questInitialStep}
        onClose={() => setQuestOpen(false)}
      />

      {graphOpen && (
        <ConnectionModal
          saint={saint}
          saintName={saintName}
          selectedIsManikkavasakar={selectedIsManikkavasakar}
          sites={topLinkedSites}
          centerLabel={selectedIsManikkavasakar ? (locale === 'ta' ? 'மா' : 'M') : undefined}
          totalConnections={selectedIsManikkavasakar ? tirumurai8.loci.length : siteLinks.size}
          unplottedLoci={selectedIsManikkavasakar ? unplottedTirumurai8Loci : []}
          onClose={() => setGraphOpen(false)}
          onSelect={(site) => {
            setSelectedSiteId(site.id);
            setTab('visits');
            setGraphOpen(false);
          }}
        />
      )}

      {sourcesOpen && (
        <SourcesModal
          data={data}
          tirumurai8={tirumurai8}
          onClose={() => setSourcesOpen(false)}
        />
      )}

      {storyOpen && saint && saintCuriosity && (
        <StoryFocus
          locale={locale}
          saint={saint}
          englishName={SAINT_EN[saint.id] ?? saint.label}
          displayName={saintName}
          hook={locale === 'ta' ? saintCuriosity.hook_ta : saintCuriosity.hook_en}
          sites={topLinkedSites.slice(0, 3).map(({ site }) => ({
            site,
            name: localizedSiteName(site, locale),
          }))}
          onClose={() => {
            setStoryOpen(false);
            if (initialRoute?.kind === 'story') {
              window.history.replaceState({}, '', saintPath(locale, saint, SAINT_EN[saint.id] ?? saint.label));
            }
          }}
          onExploreSaint={() => {
            setStoryOpen(false);
            window.history.pushState({}, '', saintPath(locale, saint, SAINT_EN[saint.id] ?? saint.label));
            requestAnimationFrame(() => document.querySelector('.saint-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
          }}
          onOpenSite={(site) => {
            setStoryOpen(false);
            setSelectedSiteId(site.id);
            setTab('visits');
            window.history.pushState({}, '', sitePath(locale, site));
            requestAnimationFrame(() => document.querySelector('.detail-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
          }}
        />
      )}

      <footer>
        <strong><GopuramIcon /> Nayanmar Trails</strong>
        <button className="footer-source-link" onClick={() => {
          setSourcesOpen(true);
          track('sources_open', { source: 'footer' });
        }}><T>Sources & methodology</T></button>
        <span>Map © OpenFreeMap / OpenMapTiles / OpenStreetMap</span>
      </footer>
    </main>
    </LocaleContext.Provider>
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



function LiterarySthalamHighlight({
  place,
  links,
  onExplore,
}: {
  place: SaivaLiteraryPlace;
  links: SaivaLiteraryLink[];
  onExplore: () => void;
}) {
  const locale = useLocale();
  const composition = links.filter(
    (link) => link.predicate === 'SOURCE_HEADER_COMPOSITION_LOCUS',
  );

  return (
    <button className="literary-place-highlight" onClick={onExplore}>
      <span className="literary-place-icon"><GopuramIcon /></span>
      <span>
        <small><T>TIRUVĀCAKAM LITERARY STHALAM</T></small>
        <b>{locale === 'ta' ? (place.label_ta || place.label) : place.label}</b>
        {locale === 'en' && place.label_ta && <em>{place.label_ta}</em>}
        <strong>
          {locale === 'ta'
            ? `${links.length} திருவாசகப் பகுதிகள் · ${composition.length === 1 ? 'பகுதி 6-ன் மூலத் தலைப்பில் தலக் குறிப்பு' : `${composition.length} பகுதிகளின் மூலத் தலைப்புகளில் தலக் குறிப்பு`}`
            : `${links.length} sections · ${composition.length === 1 ? 'section 6 source-heading locus' : composition.length + ' source-heading loci'}`}
        </strong>
      </span>
      <i>→</i>
    </button>
  );
}

function TraditionalPlaceDetail({
  saintName,
  stop,
  total,
  tab,
}: {
  saintName: string;
  stop: PlaybackStop | undefined;
  total: number;
  tab: DetailTab;
}) {
  const locale = useLocale();
  return (
    <div className="traditional-detail">
      <div className="traditional-visual">
        <div className="traditional-symbol"><GopuramIcon /></div>
        <div>
          <small><T>TRADITIONAL PLACE REFERENCE</T></small>
          <h2>{stop?.name || (locale === 'ta' ? 'தலம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை' : 'No place selected')}</h2>
          <p>{stop?.detail || (locale === 'ta' ? 'இப்போது காட்ட மரபுத் தலச் செய்தி இல்லை.' : 'No current traditional-place claim.')}</p>
        </div>
      </div>

      {tab === 'visits' && (
        <div className="text">
          <Badge kind="tradition"><T>TRADITION</T></Badge>
          <p>
            {locale === 'ta'
              ? <><b>{saintName}</b> பற்றிய மரபில் <b>{total}</b> தலங்கள் சொல்லப்படுகின்றன. அவற்றின் இன்றைய துல்லிய இடமோ பயணப்பாதையோ தெரியாதபோது நாங்கள் ஊகித்து வரைபடத்தில் காட்டுவதில்லை.</>
              : <>This site records <b>{total}</b> traditional place claim{total === 1 ? '' : 's'} for <b>{saintName}</b>. This playback keeps those claims visible without inventing modern coordinates or a travel route.</>}
          </p>
          <div className="evidence-callout muted">
            <GopuramIcon />
            <p>
              {locale === 'ta'
                ? 'இது மரபில் வரும் தலத் தொடர்பு. அதனால் மட்டும் இன்றைய எந்தக் கோயில் என்று உறுதி செய்யவோ, துல்லியமான வரைபடப் புள்ளி கொடுக்கவோ, இதை தனித்த வரலாற்றுச் சான்றாகக் கொள்ளவோ முடியாது.'
                : 'The selected item is a traditional association. It is not automatically a modern temple identification, exact geographic point, or independently verified historical event.'}
            </p>
          </div>
        </div>
      )}

      {tab === 'chronology' && (
        <div className="text">
          <Badge kind="inference"><T>NO ASSERTED JOURNEY CHRONOLOGY</T></Badge>
          <p>{locale === 'ta'
            ? 'பிறந்த தலம், தொடர்புடைய தலம், முக்தித் தலம் என்று மரபில் வரும் குறிப்புகளை வாசிக்க வசதியாக மட்டும் வரிசைப்படுத்தியுள்ளோம். அவற்றை இணைக்கும் வரலாற்றுப் பாதையை நாங்கள் ஊகிப்பதில்லை.'
            : 'Birthplace, related-place and mukti-place traditions are ordered only as a reading sequence. Nayanmar Trails does not infer the historical path between them.'}</p>
        </div>
      )}

      {tab === 'evidence' && (
        <div className="text">
          <Badge kind="tradition"><T>TRADITIONAL SOURCE</T></Badge>
          <p>{locale === 'ta'
            ? 'இடம் ஆய்வால் உறுதி செய்யப்பட்டாலோ நம்பகமான வரைபடச் சான்று கிடைத்தாலோ மட்டுமே வரைபடக் குறியீடு சேர்க்கப்படும்.'
            : 'No map marker is shown until a reviewed location is attached or another explicitly qualified location mapping.'}</p>
        </div>
      )}

      <div className="traditional-detail-footer">
        <span>{locale === 'ta' ? `${total} மரபில் வரும் தலங்கள்` : `${total} tradition claim${total === 1 ? '' : 's'}`}</span>
        <span>{locale === 'ta' ? 'ஊகித்து சேர்த்த இடங்கள்: 0' : '0 invented coordinates'}</span>
      </div>
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
  const locale = useLocale();

  if (!locus) {
    return (
      <div className="text">
        <Badge kind="edition"><T>NO MAPPED TIRUMURAI 8 LOCUS</T></Badge>
        <p>
          {locale === 'ta'
            ? 'இந்தத் தலம் பரந்த தேவாரப் பட்டியலில் இடம்பெறுகிறது. ஆனால் இப்போது பயன்படுத்தும் திருமுறை 8 பதிப்பில், மாணிக்கவாசகரின் பாடலுடன் இந்தத் தலத்தை இணைக்கும் உரைக் குறிப்பு இல்லை.'
            : 'This sthalam is part of the broader Tēvāram catalogue, but the pinned Tirumurai 8 product snapshot does not map a Manikkavasakar textual locus here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="text">
      <Badge kind="edition"><T>TIRUVĀCAKAM STHALAM</T></Badge>
      {view === 'visits' ? (
        <p>
          {locale === 'ta'
            ? 'இது திருவாசகத்தில் இந்தத் தலம் எங்கு குறிப்பிடப்படுகிறது என்பதை காட்டும் காட்சி. மாணிக்கவாசகர் இத்தலத்திற்கு வந்தார் என்ற வரலாற்றுச் சான்றோ, அவர் சென்ற பயண வரிசையோ இதனால் நிரூபிக்கப்படுவதில்லை.'
            : <>This view is a <b>textual-locus mapping</b>, not a claim of a historically verified temple visit or a travel sequence for Manikkavasakar.</>}
        </p>
      ) : (
        <p>
          {locale === 'ta'
            ? 'இப்போது பயன்படுத்தும் திருவாசகப் பதிப்பு, இந்தத் தலத்துடன் கீழே உள்ள பாடல் பகுதிகளை இணைக்கிறது.'
            : `The pinned Tiruvācakam edition metadata associates this product locus with the following section title${locus.section_numbers.length === 1 ? '' : 's'}.`}
        </p>
      )}

      <div className="locus-strip">
        <small><T>TIRUVĀCAKAM SECTIONS</T></small>
        <div>
          {locus.section_numbers.map((section, index) => (
            <span key={section} title={locus.section_titles_ta[index]}>
              <GopuramIcon />
              {locale === 'ta' ? `பகுதி ${section}` : `Section ${section}`}
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
        <p>
          {locale === 'ta'
            ? 'இந்த இணைப்பு திருமுறை 8 பதிப்பின் உரைத் தகவலை மட்டுமே காட்டுகிறது; தனித்த வரலாற்றுப் பயணச் சான்றாக எடுத்துக்கொள்ளப்படவில்லை.'
            : locus.locus_basis}
        </p>
      </div>
    </div>
  );
}


function Tirumurai8Chronology({
  snapshot,
  place,
  links,
}: {
  snapshot: Tirumurai8Snapshot;
  place: SaivaLiteraryPlace | null;
  links: SaivaLiteraryLink[];
}) {
  const locale = useLocale();
  const compositionLinks = links.filter(
    (link) => link.predicate === 'SOURCE_HEADER_COMPOSITION_LOCUS',
  );
  const textualLinks = links.filter(
    (link) => link.predicate !== 'SOURCE_HEADER_COMPOSITION_LOCUS',
  );

  return (
    <div className="text">
      <Badge kind="inference"><T>JOURNEY NOTE</T></Badge>
      <p>
        {locale === 'ta'
          ? 'திருவாசகமும் திருக்கோவையாரும் பாடல் பகுதிகளின் வரிசையைப் பாதுகாக்கின்றன. அந்த வரிசையை மாணிக்கவாசகரின் வரலாற்றுப் பயண வரிசையாக நாங்கள் எடுத்துக்கொள்வதில்லை.'
          : 'The Tiruvācakam/Tirukkōvaiyār corpus preserves section order, but section order is not treated as Manikkavasakar\'s historical itinerary.'}
      </p>
      <div className="evidence-callout">
        <GopuramIcon />
        <p>
          {locale === 'ta'
            ? 'வரைபடத்தில் தெரியும் வரிசை வாசிப்புக்கு உதவும் காட்சி மட்டுமே; ஆதாரம் இல்லாத பயணப் பாதை எதையும் இதில் உருவாக்கவில்லை.'
            : snapshot.meta.playback_policy}
        </p>
      </div>

      {place && links.length > 0 && (
        <section className="literary-place-detail">
          <small><T>BEYOND THE PLOTTED LOCI</T></small>
          <h3>{locale === 'ta' ? (place.label_ta || place.label) : place.label}</h3>
          {locale === 'en' && place.label_ta && <div className="tamil">{place.label_ta}</div>}
          <p>
            {locale === 'ta' ? (
              <>
                திருவாசகத்தில் இந்தத் தலம் <b>{links.length} பகுதிகளில்</b> வருகிறது.
                இப்போது பயன்படுத்தும் பதிப்பில் <b>{compositionLinks.length === 1 ? '6-ஆம் பகுதி மட்டும்' : `${compositionLinks.length} பகுதிகள்`}</b> மூலத் தலைப்பிலேயே இத்தலத்தைச் சுட்டுகிறது;
                மற்ற <b>{textualLinks.length}</b> இடங்கள் பாடல் உரையிலுள்ள குறிப்புகள்.
              </>
            ) : (
              <>
                Tiruvācakam connects this sthalam to <b>{links.length} sections</b>.
                The pinned edition gives <b>{compositionLinks.length === 1 ? 'section 6' : compositionLinks.length + ' sections'}</b> a source-heading composition locus; the other <b>{textualLinks.length}</b> are textual references.
              </>
            )}
          </p>
          <div className="literary-section-grid">
            {links.map((link) => {
              const section = Number(link.subject.match(/\.s(\d+)$/)?.[1] ?? 0);
              return (
                <span
                  key={link.id}
                  className={link.predicate === 'SOURCE_HEADER_COMPOSITION_LOCUS' ? 'composition' : ''}
                >
                  <b>{section}</b>
                  {locale === 'ta'
                    ? link.predicate === 'SOURCE_HEADER_COMPOSITION_LOCUS'
                      ? 'மூலத் தலைப்பில் தலக் குறிப்பு'
                      : 'பாடல் உரையில் தலக் குறிப்பு'
                    : link.predicate === 'SOURCE_HEADER_COMPOSITION_LOCUS'
                      ? 'source-heading locus'
                      : 'textual reference'}
                </span>
              );
            })}
          </div>
          <p className="reader-note">
            {locale === 'ta'
              ? 'திருஉத்தரகோசமங்கை, தேவாரம் 1–7-ன் 276 தலப் பட்டியலில் இடம்பெறும் தலம் அல்ல. ஆகவே இதற்காக தேவாரத் தலக் குறியீடோ கற்பனையான பயணக் கோடோ சேர்க்கப்படவில்லை.'
              : 'Uttarakosamangai is not a member of the formal 276-site Tēvāram 1–7 catalogue, so this view does not invent a Tēvāram marker or travel segment for it.'}
          </p>
        </section>
      )}
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
  const locale = useLocale();
  const siteName = localizedSiteName(site, locale);

  return (
    <div className="text">
      <Badge kind="edition">{locale === 'ta' ? 'திருமுறை 8 பதிப்புச் சான்று' : snapshot.authority.text.replace(/_/g, ' ')}</Badge>
      <p>
        {locale === 'ta'
          ? <>இந்தக் காட்சி நிலைப்படுத்தப்பட்ட <b>{snapshot.meta.release_id}</b> பதிப்பைப் பயன்படுத்துகிறது. ஒரு தலம் பாடலில் வருவது மற்றும் அந்தத் தலத்துக்கான தனித்த வரலாற்றுச் சான்று இருப்பது—இரண்டையும் தனித்தனியாக வைத்திருக்கிறோம்.</>
          : <>This Tirumurai 8 view uses the pinned release <b>{snapshot.meta.release_id}</b>. The historical status of each location remains separate from the text itself.</>}
      </p>
      {locus ? (
        <div className="inscription">
          <Badge kind="edition"><T>TEXTUAL LOCUS</T></Badge>
          <b>{locale === 'ta' ? (locus.label_ta || locus.display_name) : locus.display_name}</b>
          <p>
            {locale === 'ta'
              ? 'இந்தத் தலத் தொடர்பு திருமுறை 8 பதிப்பின் பாடல்/உரைத் தகவலிலிருந்து வருகிறது.'
              : locus.locus_basis}
          </p>
        </div>
      ) : (
        <div className="evidence-callout muted">
          <GopuramIcon />
          <p>
            {locale === 'ta'
              ? `இப்போது பயன்படுத்தும் திருமுறை 8 தரவுகளில் ${siteName} தலத்துடன் இணைக்கப்பட்ட பாடல் குறிப்பு இல்லை.`
              : `No Tirumurai 8 textual-locus mapping is attached to ${siteDisplayName(site)} in this product snapshot.`}
          </p>
        </div>
      )}
    </div>
  );
}

function displaySaintName(saint: Saint | null | undefined) {
  if (!saint) return 'Unknown saint';
  return SAINT_EN[saint.id] ?? cleanLabel(saint.label);
}

function SthalamOverview({
  site,
  saintName,
  selectedCount,
  totalPathigams,
  saintBreakdown,
  tirumuraiBreakdown,
  contextualHymn,
}: {
  site: Site;
  saintName: string;
  selectedCount: number;
  totalPathigams: number;
  saintBreakdown: Array<{ saintId: string; saint: Saint | null; count: number }>;
  tirumuraiBreakdown: Array<[number, number]>;
  contextualHymn?: SaivaLiteraryLink | null;
}) {
  const locale = useLocale();
  const siteName = localizedSiteName(site, locale);
  const districtName = localizedAdministrativeName(site.district, locale);
  const talukName = localizedAdministrativeName(site.taluk, locale);
  const sacredRegion = localizedSacredRegion(site.traditional_location_class, locale);

  return (
    <div className="text sthalam-overview">
      <Badge kind="edition"><T>STHALAM OVERVIEW</T></Badge>
      <p className="detail-lead">
        {locale === 'ta' ? (
          <>
            இப்போது உள்ள தேவாரப் பட்டியலில் <b>{siteName}</b> தலத்திற்கு <b>{totalPathigams}</b> பதிகங்கள் உள்ளன;
            அவை <b>{saintBreakdown.length}</b> நாயன்மார்களால் பாடப்பட்டவை.
            {selectedCount > 0 && <> இதில் <b>{saintName}</b> பாடியவை <b>{selectedCount}</b>.</>}
          </>
        ) : (
          <>
            <b>{siteName}</b> is associated with <b>{totalPathigams}</b> Tēvāram pathigam
            {totalPathigams === 1 ? '' : 's'} across <b>{saintBreakdown.length}</b> saint
            {saintBreakdown.length === 1 ? '' : 's'} in the current catalogue.
            {selectedCount > 0 && <> <b>{saintName}</b> contributes <b>{selectedCount}</b>.</>}
          </>
        )}
      </p>

      <div className="visitor-info-grid">
        <div>
          <small><T>MODERN LOCATION</T></small>
          <b>{districtName || (locale === 'ta' ? 'இடம் தரப்படவில்லை' : 'Location not supplied')}</b>
          <span>
            {site.taluk
              ? locale === 'ta'
                ? `${talukName || site.taluk} வட்டம்`
                : `${site.taluk} taluk`
              : locale === 'ta'
                ? siteName
                : site.modern_name_nic || ''}
          </span>
        </div>
        <div>
          <small><T>SACRED REGION</T></small>
          <b>{sacredRegion || (locale === 'ta' ? 'தகவல் தரப்படவில்லை' : 'Not supplied')}</b>
          <span>{locale === 'ta' ? siteName : cleanLabel(site.label)}</span>
        </div>
      </div>

      <section className="sung-here">
        <small><T>SUNG HERE</T></small>
        <div>
          {saintBreakdown.map(({ saintId, saint, count }) => (
            <span key={saintId}>
              <b>{localizedSaintName(saint, locale).split(' · ')[0]}</b>
              <em>{locale === 'ta' ? `${count} பதிக${count === 1 ? 'ம்' : 'ங்கள்'}` : `${count} pathigam${count === 1 ? '' : 's'}`}</em>
            </span>
          ))}
        </div>
      </section>

      <section className="tirumurai-spread">
        <small><T>TIRUMURAI</T></small>
        <div>
          {tirumuraiBreakdown.map(([tirumurai, count]) => (
            <span key={tirumurai}>{locale === 'ta' ? `திருமுறை ${tirumurai}` : `T${tirumurai}`} <b>{count}</b></span>
          ))}
        </div>
      </section>

      {contextualHymn && (
        <section className="contextual-hymn">
          <div className="detail-section-head">
            <div>
              <Badge kind="tradition"><T>TRADITIONAL CHRONOLOGY</T></Badge>
              <h3>{locale === 'ta' ? 'கோளறு பதிகம் · 2.085' : 'Kōḷaṟu Pathigam · 2.085'}</h3>
            </div>
            <small>{contextualHymn.formal_tevaram_sthalam_classification}</small>
          </div>
          {locale === 'ta' ? (
            <>
              <p>
                சம்பந்தரின் மரபுக் காலவரிசையில் கோளறு பதிகம் 2.085 <b>திருமறைக்காடு</b>, இன்றைய வேதாரண்யம், உடன் இணைக்கப்படுகிறது.
                ஆனால் தேவாரப் பதிப்பு இதைத் தனியாக <b>POTU</b> என்று வகைப்படுத்துகிறது. ஆகவே இத்தலத்தின் {totalPathigams} முறையான பதிகங்களில் 2.085 சேர்க்கப்படவில்லை.
              </p>
              <p className="reader-note">
                மரபுக் காலவரிசையையும் பதிப்பின் தல வகைப்பாட்டையும் ஒன்றாகக் கலக்காமல், இரண்டையும் தனித்தனியாகக் காட்டுகிறோம்.
              </p>
            </>
          ) : (
            <>
              <p>
                A traditional Sambandar chronology places Kōḷaṟu Pathigam at <b>Tirumaraikadu</b>, modern Vedaranyam.
                The formal Tēvāram edition separately classifies 2.085 as <b>POTU</b>, so it is intentionally not counted among this sthalam&apos;s {totalPathigams} formal pathigams.
              </p>
              <p className="reader-note">
                This preserves both claims without collapsing traditional chronology into formal sthalam metadata.
              </p>
            </>
          )}
        </section>
      )}

      {site.temple_identification_status && (
        <p className="reader-note">
          <b><T>Place note:</T></b> {identificationLabel(site.temple_identification_status, locale)}
        </p>
      )}
    </div>
  );
}

function ThevaramDetails({
  items,
  saintById,
  selectedSaintId,
}: {
  items: Patikam[];
  saintById: Map<string, Saint>;
  selectedSaintId: string;
}) {
  const locale = useLocale();

  return (
    <div className="text">
      <div className="detail-section-head">
        <div>
          <Badge kind="edition">{locale === 'ta' ? 'தேவாரம்' : 'TĒVĀRAM'}</Badge>
          <h3>
            {locale === 'ta'
              ? items.length === 1
                ? 'இந்தத் தலத்தில் 1 தேவாரப் பதிகம்'
                : `இந்தத் தலத்தில் ${items.length} தேவாரப் பதிகங்கள்`
              : `${items.length} pathigam${items.length === 1 ? '' : 's'} at this sthalam`}
          </h3>
        </div>
        <small>{locale === 'ta' ? 'திருமுறை 1–7' : 'Tirumurai 1–7'}</small>
      </div>

      {items.length ? (
        <ul className="hymns thevaram-list">
          {items.map((item) => {
            const author = saintById.get(item.author_saint_id);
            const selected = item.author_saint_id === selectedSaintId;
            return (
              <li key={item.id} className={selected ? 'selected-author' : ''}>
                <GopuramIcon />
                <div>
                  <b>
                    {locale === 'ta'
                      ? `திருமுறை ${item.tirumurai} · பதிகம் ${item.patikam}`
                      : `Tirumurai ${item.tirumurai} · Pathigam ${item.patikam}`}
                  </b>
                  <small>{localizedSaintName(author ?? null, locale)}</small>
                </div>
                {selected && <span className="you-are-here"><T>selected saint</T></span>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p><T>No Tēvāram pathigam is linked to this sthalam in the current catalogue.</T></p>
      )}

      <p className="reader-note">
        {locale === 'ta'
          ? <>பதிக எண்கள் இந்தத் தளம் பயன்படுத்தும் தேவாரப் பதிப்புப் பட்டியலைப் பின்பற்றுகின்றன. மூலமும் பதிப்பும் பற்றிய விவரம் <b>ஆதாரங்கள்</b> பகுதியில் உள்ளது.</>
          : <>Pathigam numbering follows the edition catalogue used by this site. Source and edition details are available under <b>Sources</b>.</>}
      </p>
    </div>
  );
}

function JourneyContext({
  saintName,
  stops,
  activeIndex,
  geographic,
}: {
  saintName: string;
  stops: PlaybackStop[];
  activeIndex: number;
  geographic: boolean;
}) {
  const locale = useLocale();
  const active = stops[Math.min(activeIndex, Math.max(0, stops.length - 1))];
  return (
    <div className="text journey-context">
      <Badge kind={geographic ? 'inference' : 'tradition'}>
        {locale === 'ta'
          ? geographic ? 'பயணக் காட்சி' : 'மரபில் வரும் தலங்கள்'
          : geographic ? 'JOURNEY VIEW' : 'TRADITIONAL PLACES'}
      </Badge>
      <h3>{saintName}</h3>
      <p>
        {locale === 'ta'
          ? geographic
            ? <>இந்த நாயன்மாருடன் தேவாரச் சான்றால் தொடர்புடைய <b>{stops.length}</b> திருத்தலங்களை வரைபடத்தில் ஒன்றன்பின் ஒன்றாகப் பாருங்கள்.</>
            : <><b>{stops.length}</b> தலங்கள் இந்த நாயன்மாருடன் மரபில் தொடர்புடையதாகச் சொல்லப்படுகின்றன. அவற்றை ஒன்றன்பின் ஒன்றாகப் பாருங்கள்.</>
          : geographic
            ? `Explore ${stops.length} mapped Tēvāram-linked sthalams for this saint.`
            : `Explore ${stops.length} traditional place references connected with this saint.`}
      </p>

      {active && (
        <div className="journey-current">
          <small><T>CURRENT STOP</T></small>
          <b>{active.name}</b>
          <span>{active.detail}</span>
        </div>
      )}

      <div className="journey-stop-list">
        {stops.slice(0, 8).map((stop, index) => (
          <span key={stop.id} className={index === activeIndex ? 'active' : ''}>
            <i>{index + 1}</i>
            <b>{stop.name}</b>
          </span>
        ))}
      </div>

      <p className="reader-note">
        {locale === 'ta'
          ? geographic
            ? 'இது கிடைத்துள்ள தலங்களைப் புரிந்துகொள்ள உதவும் காட்சி வரிசை மட்டுமே; தேதி நிர்ணயிக்கப்பட்ட வரலாற்றுப் பயணப் பாதை அல்ல.'
            : 'மரபில் வரும் தலங்களை மட்டும் காட்டுகிறோம்; தெரியாத இடத்தையும் வரலாற்றுப் பாதையையும் ஊகித்து சேர்ப்பதில்லை.'
          : geographic
            ? 'The sequence is an exploratory presentation of known endpoints, not a dated historical itinerary.'
            : 'Traditional place claims are shown without inventing precise coordinates or a historical route.'}
      </p>
    </div>
  );
}

function SourceDetails({ site, data }: { site: Site; data: PramanaExport }) {
  const locale = useLocale();
  const inscriptions = data.inscriptions.filter(
    (item) => item.ifp_site_id === site.site_id,
  );
  const catalogueUrl = site.evidence?.find((item) => item.locator.startsWith('http'))?.locator;

  return (
    <div className="text source-details">
      <div className="detail-section-head">
        <div>
          <Badge kind="edition"><T>SOURCES</T></Badge>
          <h3><T>How this sthalam is documented</T></h3>
        </div>
      </div>

      <div className="source-card">
        <small><T>TĒVĀRAM CATALOGUE</T></small>
        <b>{authorityLabel(site.authority_scope, locale)}</b>
        <p>
          {locale === 'ta'
            ? 'தலப் பெயர், பட்டியல் எண், அதனுடன் இணைக்கப்பட்ட தேவாரப் பதிகங்கள் ஆகியவை தேவாரப் பதிப்புப் பட்டியலில் இருப்பதுபோலவே பாதுகாக்கப்பட்டுள்ளன.'
            : 'The sthalam name, catalogue identifier and pathigam associations are preserved from the Tēvāram edition catalogue.'}
        </p>
        {catalogueUrl && (
          <a href={catalogueUrl} target="_blank" rel="noreferrer"><T>Open catalogue entry ↗</T></a>
        )}
      </div>

      {inscriptions.length ? (
        inscriptions.map((item) => (
          <div className="source-card historical" key={item.id}>
            <small><T>HISTORICAL RECORD</T></small>
            <b>{item.label}</b>
            <p>
              {locale === 'ta'
                ? 'இந்தக் கல்வெட்டு பதிவு, இத்தலத்துடன் தனித்த வரலாற்றுச் சான்றாக இணைக்கப்பட்டுள்ளது.'
                : item.historical_scope}
            </p>
          </div>
        ))
      ) : (
        <div className="source-card muted">
          <small><T>HISTORICAL RECORD</T></small>
          <b><T>No linked inscription in this release</T></b>
          <p>
            {locale === 'ta'
              ? 'இதனால் இந்தத் தலத்திற்கு கல்வெட்டுச் சான்றே இல்லை என்று பொருள் அல்ல; இப்போது உள்ள தரவுத் தொகுப்பில் அத்தகைய பதிவு எதுவும் இணைக்கப்படவில்லை என்பதுதான் பொருள்.'
              : 'This does not imply that the sthalam lacks historical records; only that none is attached in the current dataset.'}
          </p>
        </div>
      )}

      {site.temple_identification_status && (
        <p className="reader-note">
          <b><T>Identification note:</T></b> {identificationLabel(site.temple_identification_status, locale)}
        </p>
      )}
    </div>
  );
}

function SourcesModal({
  data,
  tirumurai8,
  onClose,
}: {
  data: PramanaExport;
  tirumurai8: Tirumurai8Snapshot;
  onClose: () => void;
}) {
  const locale = useLocale();

  return (
    <div
      className="graph-backdrop sources-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className="sources-modal"
        role="dialog"
        aria-modal="true"
        aria-label={locale === 'ta' ? 'ஆதாரங்கள் மற்றும் தொகுப்பு முறை' : 'Sources and methodology'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sources-modal-head">
          <div>
            <small><T>SOURCES · METHOD · PROVENANCE</T></small>
            <h2><T>Where Nayanmar Trails gets its information</T></h2>
            <p>
              {locale === 'ta'
                ? 'முதலில் சுற்றிப் பார்க்க எளிதாக இந்தத் தளம் வடிவமைக்கப்பட்டுள்ளது. வரைபடம், தேவாரப் பட்டியல், வரலாற்றுக் குறிப்புகள்—இவற்றின் பின்னால் எந்த ஆதாரங்கள் உள்ளன என்பதை இங்கே பார்க்கலாம்.'
                : 'The site is designed for exploration first. This page explains the source chain behind the map, Tēvāram catalogue and historical notes.'}
            </p>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label={locale === 'ta' ? 'ஆதாரங்கள் பக்கத்தை மூடு' : 'Close sources page'}
          >×</button>
        </header>

        <div className="sources-intro">
          <div>
            <b><T>What Pramāṇa contributes</T></b>
            <p>
              {locale === 'ta'
                ? 'நாயன்மார் பாதைகளின் பின்னணி ஆதாரத் தளம் பிரமாணா. ஒவ்வொரு திரையிலும் அதன் பெயரைச் சொல்லுவது நோக்கம் அல்ல; இலக்கிய மரபு, பதிப்புத் தகவல், ஆய்வு ஊகம், தனித்த வரலாற்றுச் சான்று—இவை ஒன்றோடொன்று கலந்துவிடாமல் வைத்திருப்பதே அதன் பணி.'
                : 'Pramāṇa is the versioned evidence layer behind Nayanmar Trails. Its value is not branding on every screen: it keeps textual tradition, edition metadata, inference and independent historical evidence from being silently merged.'}
            </p>
          </div>
          <div className="sources-version">
            <span><T>Dataset</T></span>
            <b>{data.meta.export_version}</b>
            <small>{locale === 'ta' ? 'மூலம்' : 'source'} {data.meta.source_commit.slice(0, 10)}</small>
          </div>
        </div>

        <div className="source-pillars">
          <article>
            <span>01</span>
            <div>
              <small><T>TĒVĀRAM CATALOGUE</T></small>
              <h3><T>798 numbered pathigams · 276 sthalams</T></h3>
              <p>
                {locale === 'ta'
                  ? 'நாயன்மார், பதிகம், திருத்தலம் ஆகியவற்றுக்கிடையிலான தொடர்புகள் பதிப்போடு ஒத்திசைக்கப்பட்ட தேவாரப் பட்டியலிலிருந்து வருகின்றன. பதிப்புகள் மாறும் இடங்களில் எண்ணிக்கையும் அதற்கேற்ற குறிப்புடன் வைக்கப்படுகிறது.'
                  : 'Saint ↔ pathigam ↔ sthalam relationships are carried from the edition-aligned Tēvāram catalogue. Numbering remains edition-qualified where sources differ.'}
              </p>
            </div>
          </article>

          <article>
            <span>02</span>
            <div>
              <small><T>PROJECT MADURAI</T></small>
              <h3><T>Source-preserved Tēvāram text layer</T></h3>
              <p>
                {locale === 'ta'
                  ? 'தேவாரத்தின் பொதுமக்களுக்கு கிடைக்கும் உரைத் தொகுப்புக்கு Project Madurai பதிப்புகள் அடிப்படையாக உள்ளன. HTML குறைபாடுகளும் எண் வேறுபாடுகளும் மறைக்கப்படாமல் பதிவு செய்யப்படுகின்றன.'
                  : 'Project Madurai provides the public-text family used for the Tēvāram beta corpus. Known HTML gaps and numbering differences remain explicit rather than being silently repaired.'}
              </p>
            </div>
          </article>

          <article>
            <span>03</span>
            <div>
              <small><T>PERIYA PURANAM</T></small>
              <h3><T>Saint story and identity links</T></h3>
              <p>
                {locale === 'ta'
                  ? 'பெரியபுராண அத்தியாயத் தகவல்கள் ஒவ்வொரு நாயன்மாரையும் அவரவர் மரபுக் கதையுடன் இணைக்கின்றன. இவை பக்தி இலக்கிய ஆதாரங்கள்; தானாகவே வரலாற்றுச் சான்றாக எடுத்துக்கொள்ளப்படுவதில்லை.'
                  : 'Periya Puranam episode metadata connects individual Nayanmars with their traditional hagiographic chapters. These are devotional-literary sources, not automatically historical proof.'}
              </p>
            </div>
          </article>

          <article>
            <span>04</span>
            <div>
              <small><T>DHARMA INSCRIPTIONS</T></small>
              <h3><T>Independent historical records</T></h3>
              <p>
                {locale === 'ta'
                  ? 'ஆய்வு செய்யப்பட்ட கல்வெட்டு ஒரு வரைபடத் தலத்துடன் இணைக்கப்பட்டிருந்தால், அதை இலக்கிய மரபிலிருந்து தனியாக வரலாற்றுச் சான்றாகக் காட்டுகிறோம்.'
                  : 'Where a reviewed inscription is linked to a mapped site, Nayanmar Trails marks it separately as an independent historical record rather than treating it as the same thing as a literary tradition.'}
              </p>
            </div>
          </article>

          <article>
            <span>05</span>
            <div>
              <small><T>TIRUMURAI 8</T></small>
              <h3><T>Manikkavasakar as Naalvar</T></h3>
              <p>
                {locale === 'ta' ? (
                  <>
                    திருவாசகமும் திருக்கோவையாரும் தனிப் பதிப்பாக இங்கே கொண்டுவரப்பட்டுள்ளன
                    ({tirumurai8.works.tiruvacakam.sections} திருவாசகப் பகுதிகள்; {tirumurai8.works.tirukkovaiyar.source_order_units} திருக்கோவையார் பாடல்கள்).
                    மாணிக்கவாசகர் நால்வரில் நான்காமவர்; அறுபத்து மூவரின் எண்ணிக்கைக்குள் சேர்க்கப்படவில்லை.
                  </>
                ) : (
                  <>
                    Tiruvācakam and Tirukkōvaiyār are carried through a separate beta snapshot
                    ({tirumurai8.works.tiruvacakam.sections} Tiruvācakam sections; {tirumurai8.works.tirukkovaiyar.source_order_units} Tirukkōvaiyār units).
                    Manikkavasakar is shown as the fourth Naalvar, not inserted into the numbered 63 Nayanmars.
                  </>
                )}
              </p>
            </div>
          </article>
        </div>

        <div className="method-strip">
          <div><b><T>Text-linked</T></b><span><T>What the editions associate with a sthalam.</T></span></div>
          <div><b><T>Tradition</T></b><span><T>Birthplace, related-place and mukti-place traditions.</T></span></div>
          <div><b><T>Historical</T></b><span><T>Independent inscriptional records where currently linked.</T></span></div>
          <div><b><T>Journey line</T></b><span><T>An exploratory reconstruction between known endpoints, never a claimed ancient road.</T></span></div>
        </div>

        <footer className="sources-modal-footer">
          <span>
            {locale === 'ta'
              ? 'இந்தத் தளத்தை ஒரு பாரம்பரியப் பயணமாக வாசியுங்கள்; எந்தத் தகவலின் பின்னுள்ள ஆதாரம் வேண்டும் என்றாலும் “ஆதாரங்கள்” பகுதியைத் திறக்கலாம்.'
              : 'Read the site as a heritage explorer; open Sources whenever you want the provenance underneath it.'}
          </span>
          <button onClick={onClose}><T>Back to exploration</T></button>
        </footer>
      </section>
    </div>
  );
}


function ConnectionModal({
  saint,
  saintName,
  selectedIsManikkavasakar,
  sites,
  centerLabel,
  totalConnections,
  unplottedLoci,
  onClose,
  onSelect,
}: {
  saint: Saint | null;
  saintName: string;
  selectedIsManikkavasakar: boolean;
  sites: Array<{ site: Site; count: number }>;
  centerLabel?: string;
  totalConnections: number;
  unplottedLoci: Tirumurai8Locus[];
  onClose: () => void;
  onSelect: (site: Site) => void;
}) {
  const locale = useLocale();

  return (
    <div
      className="graph-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className="graph-modal"
        role="dialog"
        aria-modal="true"
        aria-label={locale === 'ta'
          ? selectedIsManikkavasakar ? 'திருமுறை 8 தலத் தொடர்புகள்' : 'நாயன்மார் திருத்தலத் தொடர்புகள்'
          : selectedIsManikkavasakar ? 'Tirumurai 8 sthalam connections' : 'Saint sthalam connections'}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="graph-modal-head">
          <div>
            <small>
              {locale === 'ta'
                ? selectedIsManikkavasakar ? 'நால்வர் · திருமுறை 8' : 'தேர்ந்த நாயன்மார்'
                : selectedIsManikkavasakar ? 'NAALVAR · TIRUMURAI 8' : 'SELECTED NAYANMAR'}
            </small>
            <h2>{saintName}</h2>
            <p>
              {locale === 'ta'
                ? selectedIsManikkavasakar
                  ? `நிலைப்படுத்தப்பட்ட திருமுறை 8 பதிப்பில் ${totalConnections} தலக் குறிப்புகள் உள்ளன; ${sites.length} வரைபடத்தில் காட்டப்படுகின்றன, ${unplottedLoci.length} மூலத் தலம் பரிசீலிக்கப்பட்ட வரைபட இடமின்றி தனியாக வைக்கப்பட்டுள்ளது.`
                  : `இந்த நாயன்மாருடன் தேவாரப் பதிகங்கள் வழியாக ${totalConnections} திருத்தலங்கள் இணைகின்றன.`
                : selectedIsManikkavasakar
                  ? `${totalConnections} qualified Tiruvācakam loci: ${sites.length} mapped and ${unplottedLoci.length} explicit source-header locus kept unplotted until geometry is reviewed.`
                  : `${totalConnections} Tēvāram-linked sthalams for this saint.`}
            </p>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label={locale === 'ta' ? 'தலத் தொடர்பு காட்சியை மூடு' : 'Close connection graph'}
          >×</button>
        </header>

        <div className="graph-modal-grid">
          <div className="graph-stage">
            <Network
              saint={saint}
              centerLabel={centerLabel}
              sites={sites.slice(0, 12)}
              expanded
              onSelect={onSelect}
            />
            <div className="graph-stage-caption">
              {locale === 'ta'
                ? 'வட்டத்தின் அளவு இணைக்கப்பட்ட பதிகம் அல்லது பாடல் பகுதிகளின் எண்ணிக்கையை காட்டுகிறது. இந்த அமைப்பு வாசிப்புக்கு உதவும் காட்சி மட்டுமே; புவியியல் வரைபடமோ காலவரிசையோ அல்ல.'
                : 'Node size reflects linked pathigam or section count. Layout is a reading aid, not geography or chronology.'}
            </div>
          </div>

          <aside className="graph-ranking">
            <div className="graph-ranking-head">
              <small><T>TOP CONNECTIONS</T></small>
              <b>
                {locale === 'ta'
                  ? sites.length ? 'ஒரு திருத்தலத்தைத் தேர்ந்தெடுத்து பார்க்கவும்' : 'வரைபடத்தில் இணைக்கப்பட்ட திருத்தலங்கள் இல்லை'
                  : sites.length ? 'Select a sthalam to inspect it' : 'No mapped sthalam connections'}
              </b>
            </div>
            <div className="graph-ranking-list">
              {sites.slice(0, 12).map(({ site, count }, index) => {
                const primary = localizedSiteName(site, locale);
                const canonical = cleanLabel(site.label);
                return (
                  <button key={site.id} onClick={() => onSelect(site)}>
                    <span className="graph-rank">{String(index + 1).padStart(2, '0')}</span>
                    <span className="graph-rank-copy">
                      <b>{primary}</b>
                      {locale === 'en' && canonical.toLowerCase() !== primary.toLowerCase() && <small>{canonical}</small>}
                    </span>
                    <strong>{count}</strong>
                  </button>
                );
              })}
            </div>
            {selectedIsManikkavasakar && unplottedLoci.length > 0 && (
              <div className="graph-unplotted-list">
                <small>{locale === 'ta' ? 'வரைபடமிடாத மூலத் தலக் குறிப்பு' : 'UNPLOTTED SOURCE LOCUS'}</small>
                {unplottedLoci.map((locus) => (
                  <div key={locus.id}>
                    <span>◇</span>
                    <p>
                      <b>{locale === 'ta' ? (locus.label_ta || locus.display_name) : locus.display_name}</b>
                      <em>{locus.section_titles_ta.join(' · ')}</em>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="graph-modal-note">
          <Badge kind="edition">
            {locale === 'ta'
              ? selectedIsManikkavasakar ? 'பாடலில் வரும் தலங்கள்' : 'தேவாரத் தொடர்புகள்'
              : selectedIsManikkavasakar ? 'TEXTUAL LOCI' : 'TĒVĀRAM LINKS'}
          </Badge>
          <p>
            {locale === 'ta'
              ? selectedIsManikkavasakar
                ? 'இந்தத் தொடர்புகள் மாணிக்கவாசகரின் வரலாற்றுப் பயண வரிசையை நிரூபிப்பதில்லை.'
                : 'இவை நாயன்மார் → பதிகம் → திருத்தலம் என்ற தேவாரத் தொடர்புகளை மட்டுமே காட்டுகின்றன; வரலாற்றுப் பயணப் பாதையை நிரூபிப்பதில்லை.'
              : selectedIsManikkavasakar
                ? 'These connections do not establish Manikkavasakar’s historical itinerary.'
                : 'These edges express author → pathigam → sthalam relationships; they do not establish a historical travel route.'}
          </p>
        </div>
      </section>
    </div>
  );
}


function NetworkTempleGlyph({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g
      className="network-temple"
      transform={`translate(${x - 32 * scale} ${y - 36 * scale}) scale(${scale})`}
      aria-hidden="true"
    >
      <circle className="network-temple-finial" cx="32" cy="3.5" r="2.25" />
      <path className="network-temple-finial" d="M29.2 6h5.6l2.2 4H27z" />
      <path d="M25.5 11h13l3.2 6H22.3z" />
      <path className="network-temple-band" d="M21.2 18h21.6l2.6 2.8H18.6z" />
      <path d="M19 22h26l3.7 7.2H15.3z" />
      <path className="network-temple-band" d="M14 30.3h36l2.6 3.1H11.4z" />
      <path d="M12.5 35h39l4.1 8.3H8.4z" />
      <path className="network-temple-band" d="M7 44.7h50l2.4 3.3H4.6z" />
      <path d="M6.4 49.6h51.2L61 58H3z" />
      <path className="network-temple-base" d="M2.5 59.7h59v8.8h-59z" />
      <path className="network-temple-door" d="M25.7 48.8h12.6v19.7H25.7z" />
    </g>
  );
}


function Network({
  saint,
  sites,
  centerLabel,
  expanded = false,
  onSelect,
}: {
  saint: Saint | null;
  sites: Array<{ site: Site; count: number }>;
  centerLabel?: string;
  expanded?: boolean;
  onSelect?: (site: Site) => void;
}) {
  const locale = useLocale();
  const width = expanded ? 720 : 400;
  const height = expanded ? 360 : 170;
  const cx = width / 2;
  const cy = expanded ? 170 : 82;
  const rx = expanded ? 255 : 154;
  const ry = expanded ? 120 : 60;

  return (
    <svg
      className={`network ${expanded ? 'expanded' : ''}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={locale === 'ta' ? 'நாயன்மார் மற்றும் திருத்தலத் தொடர்புகள்' : 'Saint to sthalam graph'}
    >
      {sites.map(({ site, count }, index) => {
        const angle = (index / Math.max(sites.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * rx;
        const y = cy + Math.sin(angle) * ry;
        const label = localizedSiteName(site, locale);
        const radius = (expanded ? 8 : 4) + Math.min(count, 9) * (expanded ? .72 : .8);

        return (
          <g
            key={site.id}
            className={onSelect ? 'network-node interactive' : 'network-node'}
            onClick={() => onSelect?.(site)}
            onKeyDown={(event) => {
              if (!onSelect) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(site);
              }
            }}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect
              ? locale === 'ta' ? `${label}, ${count} தொடர்புகள்` : `${label}, ${count} linked items`
              : undefined}
          >
            <line x1={cx} y1={cy} x2={x} y2={y} />
            <circle className="network-node-halo" cx={x} cy={y} r={radius + (expanded ? 12 : 8)} />
            <NetworkTempleGlyph
              x={x}
              y={y}
              scale={(expanded ? .58 : .34) + Math.min(count, 9) * (expanded ? .012 : .01)}
            />
            {expanded && <text className="node-count" x={x} y={y + 4} textAnchor="middle">{count}</text>}
            <text
              className="node-label"
              x={x}
              y={y + (expanded ? radius + 26 : 23)}
              textAnchor="middle"
            >
              {label.slice(0, expanded ? 22 : 13)}
            </text>
          </g>
        );
      })}
      <circle className="center-halo" cx={cx} cy={cy} r={expanded ? 34 : 20} />
      <circle className="center" cx={cx} cy={cy} r={expanded ? 25 : 16} />
      <text className="center-text" x={cx} y={cy + (expanded ? 5 : 3)} textAnchor="middle">
        {centerLabel ?? saint?.ordinal ?? '—'}
      </text>
    </svg>
  );
}

function DensityPanel({ points }: { points: CoveragePoint[] }) {
  const width = 240;
  const height = 150;
  const bounds = { minLng: 76.7, maxLng: 80.55, minLat: 7.85, maxLat: 13.65 };
  const project = (lng: number, lat: number) => {
    const x = 30 + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 164;
    const y = 10 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 128;
    return [x, y] as const;
  };
  const polygon = TAMIL_NADU_SCHEMATIC
    .map(([lng, lat]) => project(lng, lat).join(','))
    .join(' ');
  const max = Math.max(...points.map((item) => item.count), 1);

  return (
    <div className="density-map">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tēvāram sthalam density by modern district">
        <defs>
          <filter id="densityGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <polygon points={polygon} className="density-land" />
        {points.map((point) => {
          const [x, y] = project(point.lng, point.lat);
          const radius = 5 + (point.count / max) * 12;
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
        <span><T>district aggregate</T></span>
        <i />
        <span><T>more sthalams</T></span>
      </div>
    </div>
  );
}
