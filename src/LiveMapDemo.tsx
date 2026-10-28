import { useEffect, useMemo, useRef, useState } from 'react';

type EventKind = 'environment' | 'public-health' | 'community-signal';
type DemoEvent = {
  id: string;
  title: string;
  kind: EventKind;
  status: 'context' | 'watch' | 'review';
  location: string;
  coordinates: [number, number];
  observedAt: string;
  summary: string;
  source: string;
  quality: string;
};

const DEMO_EVENTS: DemoEvent[] = [
  { id: 'evt-01', title: 'Elevated heat conditions', kind: 'environment', status: 'watch', location: 'Fictional Coastland', coordinates: [5.5, 8.2], observedAt: '2026-10-28T12:00:00Z', summary: 'A fictional heat observation is above the scenario baseline. It is environmental context, not evidence of a health emergency.', source: 'Synthetic training fixture', quality: 'Illustrative · not measured' },
  { id: 'evt-02', title: 'Community symptom pattern', kind: 'community-signal', status: 'review', location: 'Fictional North District', coordinates: [14.5, 2.5], observedAt: '2026-10-28T10:30:00Z', summary: 'Fictional symptom reports are higher than the scenario baseline. Counts alone do not establish an outbreak or a cause.', source: 'Synthetic training fixture', quality: 'Synthetic · human review only' },
  { id: 'evt-03', title: 'Severe weather advisory example', kind: 'environment', status: 'context', location: 'Fictional Eastern Reach', coordinates: [20, 34], observedAt: '2026-10-28T09:15:00Z', summary: 'An example advisory card used to demonstrate event details and source freshness. It is not a real advisory.', source: 'Synthetic training fixture', quality: 'Fictional event' },
  { id: 'evt-04', title: 'Public-health notice example', kind: 'public-health', status: 'context', location: 'Fictional South Bay', coordinates: [-4, 28], observedAt: '2026-10-28T08:00:00Z', summary: 'A fictional public-health notice for interface testing. No real authority has issued this notice.', source: 'Synthetic training fixture', quality: 'Fictional event' },
  { id: 'evt-05', title: 'Air-quality observation example', kind: 'environment', status: 'watch', location: 'Fictional West Valley', coordinates: [9, -8], observedAt: '2026-10-28T11:10:00Z', summary: 'A fictional air-quality observation shows how a layer may be explored. No real measurement is represented.', source: 'Synthetic training fixture', quality: 'Illustrative · not measured' },
  { id: 'evt-06', title: 'Community reporting coverage gap', kind: 'community-signal', status: 'context', location: 'Fictional Highland Area', coordinates: [29, 18], observedAt: '2026-10-28T07:30:00Z', summary: 'This fictional area has too little reporting for an assessment. Missing reports must not be interpreted as good health.', source: 'Synthetic training fixture', quality: 'Insufficient data' },
];

const KIND_LABELS: Record<EventKind, string> = {
  environment: 'Environment',
  'public-health': 'Public health',
  'community-signal': 'Community signals',
};
const STATUS_LABELS = { context: 'Context only', watch: 'Watch', review: 'Review needed' };

type LeafletMap = {
  setView: (center: [number, number], zoom: number) => LeafletMap;
  fitWorld: (options?: object) => LeafletMap;
  remove: () => void;
  on: (event: string, handler: () => void) => void;
  invalidateSize: () => void;
};
type LeafletApi = {
  map: (element: HTMLElement, options?: object) => LeafletMap;
  tileLayer: (url: string, options: object) => { addTo: (map: LeafletMap) => unknown };
  circleMarker: (coordinates: [number, number], options: object) => {
    addTo: (map: LeafletMap) => { on: (event: string, handler: () => void) => void };
  };
};

export default function LiveMapDemo() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [leaflet, setLeaflet] = useState<LeafletApi | null>(null);
  const [mapMessage, setMapMessage] = useState('Loading interactive map…');
  const [selectedId, setSelectedId] = useState(DEMO_EVENTS[0].id);
  const [activeLayers, setActiveLayers] = useState<Record<EventKind, boolean>>({
    environment: true, 'public-health': true, 'community-signal': true,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeline, setTimeline] = useState('all');

  useEffect(() => {
    let cancelled = false;
    const cssId = 'nxheal-leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const load = new Function('url', 'return import(url)') as (url: string) => Promise<LeafletApi>;
    load('https://esm.sh/leaflet@1.9.4')
      .then((module) => { if (!cancelled) { setLeaflet(module); setMapMessage(''); } })
      .catch(() => { if (!cancelled) setMapMessage('The map library could not load. Check your connection and refresh. The event list remains available below.'); });
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!leaflet || !mapElement.current || mapRef.current) return;
    const map = leaflet.map(mapElement.current, { worldCopyJump: true, scrollWheelZoom: false });
    map.setView([16, 8], 2);
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapRef.current = map;
    window.setTimeout(() => map.invalidateSize(), 120);
    return () => { map.remove(); mapRef.current = null; };
  }, [leaflet]);

  const visibleEvents = useMemo(() => DEMO_EVENTS.filter((event) => {
    if (!activeLayers[event.kind]) return false;
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    if (timeline === 'recent' && new Date(event.observedAt).getTime() < Date.now() - 6 * 60 * 60 * 1000) return false;
    return true;
  }), [activeLayers, statusFilter, timeline]);

  useEffect(() => {
    if (!leaflet || !mapRef.current) return;
    const map = mapRef.current;
    visibleEvents.forEach((event) => {
      const color = event.status === 'review' ? '#c56b43' : event.status === 'watch' ? '#c6a34d' : '#588b73';
      const marker = leaflet.circleMarker(event.coordinates, {
        radius: event.id === selectedId ? 9 : 6,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      }).addTo(map);
      marker.on('click', () => setSelectedId(event.id));
    });
  }, [leaflet, visibleEvents, selectedId]);

  const selected = DEMO_EVENTS.find((event) => event.id === selectedId) ?? DEMO_EVENTS[0];

  function toggleLayer(kind: EventKind) {
    setActiveLayers((current) => ({ ...current, [kind]: !current[kind] }));
  }

  function focusEvent(event: DemoEvent) {
    setSelectedId(event.id);
    mapRef.current?.setView(event.coordinates, 4);
    mapElement.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <main className="live-map-shell">
      <header className="live-map-header">
        <a className="brand" href="./" aria-label="Return to NxHeal personal journal"><span className="brand-mark" aria-hidden="true">n</span><span>NxHeal</span></a>
        <div className="live-map-header-right"><span className="live-map-demo-tag">STAGE 1 · INTERACTIVE PROTOTYPE</span><a className="live-map-back" href="./">Personal journal ↗</a></div>
      </header>

      <section className="live-map-intro">
        <p className="eyebrow"><span className="live-map-pulse" /> GLOBAL EVENT EXPLORER</p>
        <h1>See the bigger <em>health picture.</em></h1>
        <p>Explore a global map interface for environmental context, public-health notices, and community signals. This first-stage experience uses fictional events only.</p>
        <div className="live-map-notice" role="note"><strong>DEMO MODE · NO LIVE DATA</strong><span>Every event and location below is synthetic. The map tiles are real geography, but the markers are not real incidents, measurements, or alerts. No personal journal data is used.</span></div>
      </section>

      <section className="live-map-workspace" aria-label="Interactive global event explorer">
        <aside className="live-map-controls">
          <div className="live-map-section-title"><span>EXPLORE LAYERS</span><span>{visibleEvents.length} visible</span></div>
          {(['environment', 'public-health', 'community-signal'] as EventKind[]).map((kind) => (
            <label className="live-map-layer" key={kind}>
              <input type="checkbox" checked={activeLayers[kind]} onChange={() => toggleLayer(kind)} />
              <span className={'live-map-layer-dot ' + kind} aria-hidden="true" />
              <span><strong>{KIND_LABELS[kind]}</strong><small>{kind === 'environment' ? 'Heat, weather, air quality' : kind === 'public-health' ? 'Official notices and advisories' : 'Aggregated signals and coverage'}</small></span>
            </label>
          ))}
          <label className="live-map-select-label">Signal status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option><option value="context">Context only</option><option value="watch">Watch</option><option value="review">Review needed</option>
            </select>
          </label>
          <label className="live-map-select-label">Time window
            <select value={timeline} onChange={(event) => setTimeline(event.target.value)}>
              <option value="all">All demo events</option><option value="recent">Last 6 hours (demo timestamps)</option>
            </select>
          </label>
          <button type="button" className="live-map-reset" onClick={() => { setActiveLayers({ environment: true, 'public-health': true, 'community-signal': true }); setStatusFilter('all'); setTimeline('all'); setSelectedId(DEMO_EVENTS[0].id); mapRef.current?.fitWorld(); }}>Reset map filters</button>
          <div className="live-map-legend"><span>STATUS KEY</span><p><i className="context" /> Context only</p><p><i className="watch" /> Watch</p><p><i className="review" /> Review needed</p></div>
        </aside>

        <div className="live-map-main">
          <div className="live-map-map-heading"><div><strong>World view</strong><span>Pan and zoom to explore</span></div><span className="live-map-data-label">Synthetic event markers</span></div>
          <div className="live-map-canvas-wrap">
            <div ref={mapElement} className="live-map-canvas" aria-label="Interactive world map showing synthetic demonstration events" />
            {mapMessage && <div className="live-map-map-message" role="status">{mapMessage}</div>}
            <div className="live-map-map-caption">Map geography: OpenStreetMap contributors · Events: fictional demo fixtures</div>
          </div>
          <div className="live-map-event-detail" aria-live="polite">
            <div className="live-map-detail-top"><span className={'live-map-status status-' + selected.status}>{STATUS_LABELS[selected.status]}</span><span className="live-map-detail-kind">{KIND_LABELS[selected.kind]}</span></div>
            <h2>{selected.title}</h2>
            <p>{selected.summary}</p>
            <div className="live-map-detail-facts"><div><span>Location</span><strong>{selected.location}</strong></div><div><span>Demo timestamp</span><strong>{new Date(selected.observedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</strong></div><div><span>Source</span><strong>{selected.source}</strong></div><div><span>Data quality</span><strong>{selected.quality}</strong></div></div>
          </div>
        </div>
      </section>

      <section className="live-map-feed">
        <div className="live-map-feed-heading"><div><p className="eyebrow">EVENT STREAM</p><h2>Explore demo events</h2></div><span>Sorted by demo timestamp</span></div>
        <div className="live-map-event-list">
          {visibleEvents.slice().sort((a, b) => b.observedAt.localeCompare(a.observedAt)).map((event) => (
            <button type="button" className={'live-map-event-row ' + (selectedId === event.id ? 'selected' : '')} key={event.id} onClick={() => focusEvent(event)}>
              <span className={'live-map-event-icon ' + event.status} aria-hidden="true">{event.kind === 'environment' ? '≈' : event.kind === 'public-health' ? '＋' : '◎'}</span>
              <span className="live-map-event-copy"><strong>{event.title}</strong><small>{event.location} · {KIND_LABELS[event.kind]}</small><small>{new Date(event.observedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</small></span>
              <span className={'live-map-status status-' + event.status}>{STATUS_LABELS[event.status]}</span>
            </button>
          ))}
          {visibleEvents.length === 0 && <p className="live-map-empty">No demo events match these filters. Turn on a layer or reset the filters.</p>}
        </div>
      </section>

      <footer className="live-map-footer">NxHeal Stage 1 prototype · not monitored live · no official alerts · no personal health records displayed</footer>
    </main>
  );
}
