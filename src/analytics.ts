export type AnalyticsEvent =
  | 'page_view'
  | 'start_here_view'
  | 'start_here_action'
  | 'saint_selected'
  | 'story_open'
  | 'site_selected'
  | 'search_select'
  | 'map_interaction'
  | 'sources_open'
  | 'share'
  | 'route_open'
  | 'quest_open'
  | 'quest_start'
  | 'quest_step'
  | 'quest_answer'
  | 'quest_complete'
  | 'quest_replay'
  | 'app_error';

const SESSION_KEY = 'nayanmar-trails-session';

function sessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return 'anonymous';
  }
}

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean | null | undefined> = {}) {
  if (navigator.doNotTrack === '1') return;
  const payload = JSON.stringify({
    event,
    session: sessionId(),
    path: window.location.pathname,
    locale: document.documentElement.lang || 'en',
    properties,
    ts: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon('/api/event', new Blob([payload], { type: 'application/json' }));
      if (ok) return;
    }
  } catch {
    // fall through to fetch
  }

  fetch('/api/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
