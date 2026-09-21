export type AuthorityScope = 'traditional_reference' | 'primary_text_metadata' | 'edition_metadata' | 'epigraphic_primary' | string;

export interface Saint {
  id: string;
  ordinal: number;
  label: string;
  label_ta: string | null;
  authority_scope: AuthorityScope;
}

export interface Site {
  id: string;
  site_id: string;
  label: string;
  label_ta: string | null;
  aliases: string[];
  district: string | null;
  taluk: string | null;
  traditional_location_class: string | null;
  modern_name_nic: string | null;
  patikam_count: number;
  authority_scope: AuthorityScope;
}

export interface Patikam {
  id: string;
  tirumurai: number;
  patikam: number;
  author_saint_id: string;
  site_linked: boolean;
  authority_scope: AuthorityScope;
}

export interface Edge {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  status: string | null;
  authority_scope: AuthorityScope;
  historical_verified: boolean | null;
  confidence_basis: string | null;
}

export interface Inscription {
  id: string;
  label: string;
  authority_scope: AuthorityScope;
  site_name: string | null;
  ifp_site_id: string | null;
  temple_name: string | null;
  historical_scope: string | null;
}

export interface PramanaExport {
  meta: {
    export_version: string;
    source_repo: string;
    source_commit: string;
    source_blob: string;
    source_path: string;
    graph_id: string;
    exported_at: string;
    counts: Record<string, number>;
    authority_semantics: Record<string, string>;
    route_policy: string;
  };
  saints: Saint[];
  sites: Site[];
  patikams: Patikam[];
  inscriptions: Inscription[];
  edges: Edge[];
}
