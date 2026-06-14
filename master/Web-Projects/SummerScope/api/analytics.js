// SummerScope Analytics API
// GET /api/analytics?days=7|30|90
// Requires env vars: SUPABASE_SERVICE_KEY, DASHBOARD_PASSWORD

const SUPABASE_BASE = 'https://fdpwoccrmdyuhelyocpk.supabase.co/rest/v1';
const PAGE_SIZE = 1000;
const MAX_PAGES = 100; // up to 100k events per request

function countBy(arr, key) {
  const m = {};
  arr.forEach(e => { const v = e[key]; if (v != null && v !== '') m[v] = (m[v] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
}

function countArr(arr) {
  const m = {};
  arr.forEach(v => { if (v) m[String(v)] = (m[String(v)] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
}

function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

function parseMeta(e) {
  const meta = e.metadata;
  if (!meta) return null;
  if (typeof meta === 'string') {
    try { return JSON.parse(meta); } catch { return null; }
  }
  return typeof meta === 'object' ? meta : null;
}

async function fetchAllEvents(since, key) {
  const cols = 'event_type,page,visitor_id,session_id,referrer,device_type,browser,os,scroll_depth,duration_ms,element,element_label,search_query,created_at,metadata,utm_source';
  const events = [];
  let truncated = false;

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const url = `${SUPABASE_BASE}/events?select=${cols}&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=${PAGE_SIZE}&offset=${offset}`;
    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!r.ok) throw new Error(await r.text());

    const batch = await r.json();
    if (!Array.isArray(batch)) throw new Error('unexpected_response');

    events.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    if (page === MAX_PAGES - 1) truncated = true;
  }

  events.reverse();
  return { events, truncated };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).end();

  const pw   = process.env.DASHBOARD_PASSWORD;
  const auth = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!pw) return res.status(503).json({ error: 'dashboard_not_configured' });
  if (auth !== pw) return res.status(401).json({ error: 'unauthorized' });

  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) return res.status(500).json({ error: 'not_configured' });

  const days  = Math.min(parseInt(req.query?.days || req.url?.split('days=')[1]) || 7, 90);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  let events, truncated;
  try {
    ({ events, truncated } = await fetchAllEvents(since, key));
  } catch (err) {
    return res.status(502).json({ error: 'db_error', detail: String(err.message || err) });
  }

  const pageviews  = events.filter(e => e.event_type === 'pageview');
  const sessionEnd = events.filter(e => e.event_type === 'session_end');
  const scrollEvts = events.filter(e => e.event_type === 'scroll');
  const clickEvts  = events.filter(e => e.event_type === 'click');
  const searchEvts = events.filter(e => e.event_type === 'search');

  const uniqueVisitors = new Set(pageviews.map(e => e.visitor_id).filter(Boolean)).size;
  const uniqueSessions = new Set(pageviews.map(e => e.session_id).filter(Boolean)).size;

  const durations = sessionEnd.map(e => e.duration_ms).filter(v => v > 0 && v < 3600000);
  const avgDurationSec = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 1000)
    : 0;

  // New vs returning — count unique visitors by their earliest pageview in range
  const firstPageviewByVisitor = new Map();
  pageviews.forEach(e => {
    if (!e.visitor_id) return;
    const prev = firstPageviewByVisitor.get(e.visitor_id);
    if (!prev || e.created_at < prev.created_at) firstPageviewByVisitor.set(e.visitor_id, e);
  });

  let newVisitors = 0;
  let returningVisitors = 0;
  firstPageviewByVisitor.forEach(e => {
    const meta = parseMeta(e);
    if (meta && meta.returning === true) returningVisitors++;
    else newVisitors++;
  });

  const byDayMap = {};
  pageviews.forEach(e => { const d = e.created_at.slice(0, 10); byDayMap[d] = (byDayMap[d] || 0) + 1; });
  const pageviewsByDay = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    pageviewsByDay.push({ date: d, count: byDayMap[d] || 0 });
  }

  const byPage    = countBy(pageviews, 'page');
  const byDevice  = countBy(pageviews, 'device_type');
  const byBrowser = countBy(pageviews, 'browser');
  const byOS      = countBy(pageviews, 'os');

  const ownHost = 'summerscope';
  const refHosts = pageviews
    .filter(e => e.referrer)
    .map(e => hostname(e.referrer))
    .filter(h => h && !h.includes(ownHost));
  const topReferrers = countArr(refHosts).slice(0, 10);

  const utmSources = pageviews
    .map(e => e.utm_source || (parseMeta(e) || {}).utm_source)
    .filter(Boolean);
  const topUTMSources = countArr(utmSources).slice(0, 10);

  // Unique sessions reaching each scroll milestone
  const scrollDepth = [25, 50, 75, 100].map(m => {
    const sessions = new Set(
      scrollEvts.filter(e => e.scroll_depth === m && e.session_id).map(e => e.session_id)
    );
    return { label: m + '%', count: sessions.size };
  });

  const topPrograms = countArr(
    clickEvts.filter(e => e.element === 'program_card').map(e => e.element_label).filter(Boolean)
  ).slice(0, 10);

  const topEvents = countArr(
    clickEvts.filter(e => e.element === 'event_card').map(e => e.element_label).filter(Boolean)
  ).slice(0, 10);

  const topNavTabs = countArr(
    clickEvts.filter(e => e.element === 'nav_tab').map(e => e.element_label).filter(Boolean)
  );

  const topEventFilters = countArr(
    clickEvts.filter(e => e.element === 'event_filter_btn').map(e => e.element_label).filter(Boolean)
  ).slice(0, 10);

  const topSorts = countArr(
    clickEvts.filter(e => e.element === 'sort_dropdown').map(e => e.element_label).filter(Boolean)
  ).slice(0, 10);

  const clearFiltersCount = clickEvts.filter(e => e.element === 'clear_filters').length;

  const topSearches = countArr(
    searchEvts.map(e => e.search_query).filter(Boolean)
  ).slice(0, 15);

  const topFilters = countArr(
    clickEvts.filter(e => e.element === 'filter_checkbox').map(e => e.element_label).filter(Boolean)
  ).slice(0, 15);

  const topLinks = countArr(
    clickEvts.filter(e => e.element === 'external_link').map(e => {
      try { return new URL(e.element_label).hostname.replace(/^www\./, '') + new URL(e.element_label).pathname.slice(0, 30); }
      catch { return e.element_label; }
    }).filter(Boolean)
  ).slice(0, 10);

  const topButtons = countArr(
    clickEvts.filter(e => e.element === 'button').map(e => e.element_label).filter(Boolean)
  ).slice(0, 10);

  return res.status(200).json({
    generated_at:     new Date().toISOString(),
    range_days:       days,
    data_truncated:   truncated,
    summary: {
      total_pageviews:    pageviews.length,
      unique_visitors:    uniqueVisitors,
      unique_sessions:    uniqueSessions,
      avg_duration_sec:   avgDurationSec,
      returning_visitors: returningVisitors,
      new_visitors:       newVisitors,
      total_events:       events.length,
      clear_filters:      clearFiltersCount,
    },
    pageviews_by_day: pageviewsByDay,
    by_page:          byPage,
    by_device:        byDevice,
    by_browser:       byBrowser,
    by_os:            byOS,
    top_referrers:    topReferrers,
    top_utm_sources:  topUTMSources,
    scroll_depth:     scrollDepth,
    top_programs:     topPrograms,
    top_events:       topEvents,
    top_nav_tabs:     topNavTabs,
    top_event_filters: topEventFilters,
    top_sorts:        topSorts,
    top_buttons:      topButtons,
    top_searches:     topSearches,
    top_filters:      topFilters,
    top_links:        topLinks,
  });
}
