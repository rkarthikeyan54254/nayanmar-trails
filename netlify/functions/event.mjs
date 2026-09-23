const allowed = new Set([
  'page_view',
  'start_here_view',
  'start_here_action',
  'saint_selected',
  'story_open',
  'site_selected',
  'search_select',
  'map_interaction',
  'sources_open',
  'share',
  'route_open',
  'app_error',
]);

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), {
      status: 405,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  try {
    const value = await request.json();
    if (!allowed.has(value?.event)) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    }

    const event = {
      event: value.event,
      session: String(value.session || '').slice(0, 80),
      path: String(value.path || '').slice(0, 300),
      locale: value.locale === 'ta' ? 'ta' : 'en',
      properties: value.properties && typeof value.properties === 'object' ? value.properties : {},
      ts: String(value.ts || '').slice(0, 40),
      release: process.env.COMMIT_REF || 'netlify',
    };

    console.log('NAYANMAR_EVENT', JSON.stringify(event));
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }
};
