import { useEffect, useMemo, useRef, useState } from 'react';
import './live-map.css';

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
const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY?.trim();

type LeafletMap = {
  setView: (center: [number, number], zoom: number, options?: object) => LeafletMap;
  fitWorld: (options?: object) => LeafletMap;
  flyTo: (center: [number, number], zoom: number, options?: object) => LeafletMap;
  setZoom: (zoom: number, options?: object) => LeafletMap;
  remove: () => void;
  invalidateSize: () => void;
};
type LeafletLayerGroup = {
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  clearLayers: () => void;
};
type PlaceResult = { place_id: number; display_name: string; lat: string; lon: string };
type LeafletApi = {
  layerGroup: () => LeafletLayerGroup;
  map: (element: HTMLElement, options?: object) => LeafletMap;
  tileLayer: (url: string, options: object) => { addTo: (map: LeafletMap) => unknown };
  circleMarker: (coordinates: [number, number], options: object) => {
    addTo: (layer: LeafletLayerGroup) => { on: (event: string, handler: () => void) => void };
  };
};

export default function LiveMapDemo() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LeafletLayerGroup | null>(null);
  const replayTimerRef = useRef<number | null>(null);
  const [leaflet, setLeaflet] = useState<LeafletApi | null>(null);
  const [mapMessage, setMapMessage] = useState('Preparing global map…');
  const [selectedId, setSelectedId] = useState(DEMO_EVENTS[0].id);
  const [activeLayers, setActiveLayers] = useState<Record<EventKind, boolean>>({
    environment: true, 'public-health': true, 'community-signal': true,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeline, setTimeline] = useState('all');
  const [isReplaying, setIsReplaying] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [placeMessage, setPlaceMessage] = useState('');
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const lastPlaceSearchRef = useRef(0);

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
      .catch(() => { if (!cancelled) setMapMessage('The map library could not load. The synthetic event feed remains available below. Check your connection and refresh.'); });
    return () => {
      cancelled = true;
      if (replayTimerRef.current !== null) window.clearInterval(replayTimerRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leaflet || !mapElement.current || mapRef.current) return;
    const map = leaflet.map(mapElement.current, { worldCopyJump: true, scrollWheelZoom: false, zoomControl: true });
    map.setView([16, 8], 2);
    const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' +
      (CARTO_API_KEY ? '?key=' + encodeURIComponent(CARTO_API_KEY) : '');
    leaflet.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);
    mapRef.current = map;
    markerLayerRef.current = leaflet.layerGroup().addTo(map);
    window.setTimeout(() => map.invalidateSize(), 180);
    return () => { map.remove(); mapRef.current = null; markerLayerRef.current = null; };
  }, [leaflet]);

  const visibleEvents = useMemo(() => DEMO_EVENTS.filter((event) => {
    if (!activeLayers[event.kind]) return false;
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    if (timeline === 'recent' && event.observedAt < DEMO_EVENTS.slice().sort((a, b) => b.observedAt.localeCompare(a.observedAt))[2].observedAt) return false;
    if (timeline === 'review' && event.status !== 'review') return false;
    return true;
  }), [activeLayers, statusFilter, timeline]);

  useEffect(() => {
    if (!leaflet || !mapRef.current || !markerLayerRef.current) return;
    const markerLayer = markerLayerRef.current;
    markerLayer.clearLayers();
    visibleEvents.forEach((event) => {
      const color = event.status === 'review' ? '#ff856d' : event.status === 'watch' ? '#ffc66d' : '#62d8c6';
      const marker = leaflet.circleMarker(event.coordinates, {
        radius: event.id === selectedId ? 10 : 7,
        color: event.id === selectedId ? '#ffffff' : color,
        weight: event.id === selectedId ? 3 : 2,
        fillColor: color,
        fillOpacity: 0.98,
        className: event.status === 'review' ? 'nxheal-map-marker nxheal-map-marker-review' : 'nxheal-map-marker',
      }).addTo(markerLayer);
      marker.on('click', () => setSelectedId(event.id));
    });
  }, [leaflet, visibleEvents, selectedId]);

  useEffect(() => {
    if (!isReplaying) return;
    replayTimerRef.current = window.setInterval(() => {
      setSelectedId((currentId) => {
        const currentIndex = DEMO_EVENTS.findIndex((event) => event.id === currentId);
        return DEMO_EVENTS[(currentIndex + 1) % DEMO_EVENTS.length].id;
      });
    }, 2200);
    return () => {
      if (replayTimerRef.current !== null) window.clearInterval(replayTimerRef.current);
      replayTimerRef.current = null;
    };
  }, [isReplaying]);

  const selected = DEMO_EVENTS.find((event) => event.id === selectedId) ?? DEMO_EVENTS[0];
  const reviewCount = DEMO_EVENTS.filter((event) => event.status === 'review').length;
  const watchCount = DEMO_EVENTS.filter((event) => event.status === 'watch').length;

  function toggleLayer(kind: EventKind) {
    setActiveLayers((current) => ({ ...current, [kind]: !current[kind] }));
  }

  function focusEvent(event: DemoEvent) {
    setSelectedId(event.id);
    mapRef.current?.setView(event.coordinates, 4);
  }


  async function searchPlaces(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = placeQuery.trim();
    if (query.length < 2) { setPlaceMessage('Enter at least two characters to search.'); return; }
    const wait = 1000 - (Date.now() - lastPlaceSearchRef.current);
    if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait));
    lastPlaceSearchRef.current = Date.now();
    setIsSearchingPlace(true);
    setPlaceMessage('Searching place names…');
    setPlaceResults([]);
    try {
      const response = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=' + encodeURIComponent(query), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Place search is temporarily unavailable.');
      const results = await response.json() as PlaceResult[];
      setPlaceResults(results);
      setPlaceMessage(results.length ? 'Choose a place to move the map. This does not mean NxHeal has health reports for that place.' : 'No matching place found. Try a nearby town, city or country.');
    } catch {
      setPlaceMessage('Place search could not connect. You can still pan and zoom the map manually.');
    } finally { setIsSearchingPlace(false); }
  }

  function focusPlace(place: PlaceResult) {
    const lat = Number(place.lat);
    const lng = Number(place.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    stopReplay();
    mapRef.current?.flyTo([lat, lng], 11, { animate: true, duration: 1.1 });
    setPlaceQuery(place.display_name.split(',')[0]);
    setPlaceResults([]);
    setPlaceMessage('Map location selected. Health data availability is not implied.');
  }

  function changeGeographicZoom(value: string) {
    const map = mapRef.current;
    if (!map) return;
    if (value === 'world') { map.flyTo([16, 8], 2, { animate: true, duration: 1 }); return; }
    const zoom = Number(value);
    if (Number.isFinite(zoom)) map.setZoom(zoom, { animate: true });
  }

  function stopReplay() {
    setIsReplaying(false);
  }

  return (
    <main className="live-map-shell">
      <header className="live-map-header">
        <a className="live-map-brand" href="./" aria-label="Return to NxHeal personal journal">
          <span className="live-map-brand-mark" aria-hidden="true">n</span>
          <span><strong>NxHeal</strong><small>GLOBAL HEALTH INTELLIGENCE</small></span>
        </a>
        <div className="live-map-header-right">
          <span className="live-map-prototype"><i /> SYNTHETIC DEMO</span>
          <a className="live-map-back" href="./">Personal journal <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="live-map-dashboard-intro">
        <div><p className="live-map-kicker">GLOBAL HEALTH SIGNALS <span> / </span> EXPLORER</p><h1>Understand the <em>signals.</em></h1><p className="live-map-subtitle">A global view of environmental context, public-health information and community patterns.</p></div>
        <div className="live-map-intro-note"><span className="live-map-note-icon">i</span><span><strong>Prototype environment</strong><small>All event markers and observations are fictional. No live feeds or personal journal records are connected.</small></span></div>
      </section>

      <section className="live-map-metrics" aria-label="Synthetic demo summary">
        <article><span className="live-map-metric-icon mint">⌁</span><div><small>DEMO EVENTS</small><strong>{DEMO_EVENTS.length.toString().padStart(2, '0')}</strong><span>Across 3 signal layers</span></div></article>
        <article><span className="live-map-metric-icon amber">◌</span><div><small>WATCH CONTEXTS</small><strong>{watchCount.toString().padStart(2, '0')}</strong><span>Illustrative observations</span></div></article>
        <article><span className="live-map-metric-icon coral">◎</span><div><small>REVIEW EXAMPLE</small><strong>{reviewCount.toString().padStart(2, '0')}</strong><span>Human review only</span></div></article>
        <article className="live-map-metric-source"><span className="live-map-metric-icon blue">◷</span><div><small>DATA MODE</small><strong>Demo replay</strong><span>No real-time monitoring</span></div></article>
      </section>

      <section className="live-map-workspace" aria-label="Global health intelligence explorer">
        <aside className="live-map-controls">
          <div className="live-map-panel-heading"><span>MAP LAYERS</span><span className="live-map-count">{visibleEvents.length} visible</span></div>
          {(['environment', 'public-health', 'community-signal'] as EventKind[]).map((kind) => (
            <label className="live-map-layer" key={kind}>
              <input type="checkbox" checked={activeLayers[kind]} onChange={() => { stopReplay(); toggleLayer(kind); }} />
              <span className={'live-map-layer-dot ' + kind} aria-hidden="true" />
              <span><strong>{KIND_LABELS[kind]}</strong><small>{kind === 'environment' ? 'Heat, weather, air quality' : kind === 'public-health' ? 'Notices and advisories' : 'Patterns and reporting coverage'}</small></span>
            </label>
          ))}
          <div className="live-map-control-divider" />
          <label className="live-map-select-label">Signal status
            <select value={statusFilter} onChange={(event) => { stopReplay(); setStatusFilter(event.target.value); }}>
              <option value="all">All statuses</option><option value="context">Context only</option><option value="watch">Watch</option><option value="review">Review needed</option>
            </select>
          </label>
          <label className="live-map-select-label">Explore window
            <select value={timeline} onChange={(event) => { stopReplay(); setTimeline(event.target.value); }}>
              <option value="all">All demo events</option><option value="recent">Latest 3 demo events</option><option value="review">Review examples</option>
            </select>
          </label>
          <button type="button" className="live-map-reset" onClick={() => { stopReplay(); setActiveLayers({ environment: true, 'public-health': true, 'community-signal': true }); setStatusFilter('all'); setTimeline('all'); setSelectedId(DEMO_EVENTS[0].id); mapRef.current?.fitWorld({ animate: true }); }}>Reset view <span aria-hidden="true">↺</span></button>
          <div className="live-map-legend"><span>STATUS KEY</span><p><i className="context" /> Context only</p><p><i className="watch" /> Watch context</p><p><i className="review" /> Human review needed</p></div>
          <p className="live-map-sidebar-footnote">Time filters use the fixed synthetic scenario, not a live clock.</p>
        </aside>

        <div className="live-map-main">
          <div className="live-map-map-heading"><div><strong>Global overview</strong><span>Pan to explore · select a marker for details</span></div><label className="live-map-zoom-label">Geographic view<select aria-label="Geographic zoom level" defaultValue="world" onChange={(event) => changeGeographicZoom(event.target.value)}><option value="world">World</option><option value="4">Continent / region</option><option value="6">Country / state</option><option value="9">City / town</option><option value="12">Village / local area</option><option value="15">Street / workplace area</option></select></label><span className="live-map-map-badge"><i /> DEMO MAP</span></div>
          <form className="live-map-place-search" onSubmit={searchPlaces} role="search"><label htmlFor="live-map-place-query">Explore a real place</label><div className="live-map-place-search-row"><input id="live-map-place-query" value={placeQuery} onChange={(event) => setPlaceQuery(event.target.value)} placeholder="Search country, city, town or village" autoComplete="off" /><button type="submit" disabled={isSearchingPlace}>{isSearchingPlace ? 'Searching…' : 'Find place'}</button></div>{placeMessage && <p role="status">{placeMessage}</p>}{placeResults.length > 0 && <div className="live-map-place-results" role="listbox" aria-label="Place search results">{placeResults.map((place) => <button key={place.place_id} type="button" role="option" onClick={() => focusPlace(place)}>{place.display_name}</button>)}</div>}</form>
          <div className="live-map-canvas-wrap">
            <div ref={mapElement} className="live-map-canvas" aria-label="Interactive world map showing fictional demonstration events" />
            {mapMessage && <div className="live-map-map-message" role="status">{mapMessage}</div>}
            <div className="live-map-map-overlay"><span>WORLD VIEW</span><span>FICTIONAL EVENT LOCATIONS</span></div>
            <div className="live-map-map-caption">Basemap: CARTO · © OpenStreetMap contributors · Place search: OpenStreetMap · Events: synthetic fixtures</div>
          </div>
          <div className="live-map-timeline">
            <div className="live-map-timeline-head"><div><span className="live-map-timeline-dot" /><strong>Scenario activity</strong><small>Illustrative sequence · not live</small></div><button type="button" className={isReplaying ? 'live-map-replay active' : 'live-map-replay'} onClick={() => setIsReplaying((playing) => !playing)}>{isReplaying ? 'Ⅱ Pause replay' : '▶ Play replay'}</button></div>
            <div className="live-map-timeline-track" aria-label="Synthetic event sequence">
              {DEMO_EVENTS.slice().sort((a, b) => a.observedAt.localeCompare(b.observedAt)).map((event, index) => (
                <button key={event.id} type="button" aria-label={'Select scenario event: ' + event.title} title={event.title} className={'live-map-timeline-point ' + event.status + (selectedId === event.id ? ' selected' : '')} style={{ left: (index / (DEMO_EVENTS.length - 1) * 100) + '%' }} onClick={() => { stopReplay(); focusEvent(event); }} />
              ))}
            </div>
            <div className="live-map-timeline-labels"><span>Earlier demo observations</span><span>Later demo observations</span></div>
          </div>
        </div>

        <aside className="live-map-intel">
          <div className="live-map-panel-heading"><span>EVENT INTELLIGENCE</span><span className="live-map-intel-index">{String(DEMO_EVENTS.findIndex((event) => event.id === selected.id) + 1).padStart(2, '0')} / {String(DEMO_EVENTS.length).padStart(2, '0')}</span></div>
          <div className="live-map-intel-status"><span className={'live-map-status status-' + selected.status}><i />{STATUS_LABELS[selected.status]}</span><span className="live-map-detail-kind">{KIND_LABELS[selected.kind]}</span></div>
          <h2>{selected.title}</h2>
          <p className="live-map-intel-summary">{selected.summary}</p>
          <div className="live-map-intel-facts"><div><span>LOCATION</span><strong>{selected.location}</strong></div><div><span>DEMO TIMESTAMP</span><strong>{new Date(selected.observedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</strong></div><div><span>SOURCE</span><strong>{selected.source}</strong></div><div><span>DATA QUALITY</span><strong>{selected.quality}</strong></div></div>
          <div className="live-map-review-note"><span aria-hidden="true">✳</span><p><strong>Interpret with care</strong> This is a synthetic example, not a confirmed health event. Counts and environmental context alone do not establish cause or outbreak.</p></div>
          <button type="button" className="live-map-focus-button" onClick={() => mapRef.current?.setView(selected.coordinates, 4, { animate: true })}>Focus this location <span aria-hidden="true">↗</span></button>
        </aside>
      </section>

      <section className="live-map-feed">
        <div className="live-map-feed-heading"><div><p className="live-map-kicker">SYNTHETIC EVENT STREAM</p><h2>Explore the scenario</h2></div><span>{visibleEvents.length} events match your filters</span></div>
        <div className="live-map-event-list">
          {visibleEvents.slice().sort((a, b) => b.observedAt.localeCompare(a.observedAt)).map((event) => (
            <button type="button" className={'live-map-event-row ' + (selectedId === event.id ? 'selected' : '')} key={event.id} onClick={() => { stopReplay(); focusEvent(event); }}>
              <span className={'live-map-event-icon ' + event.status} aria-hidden="true">{event.kind === 'environment' ? '⌁' : event.kind === 'public-health' ? '＋' : '◎'}</span>
              <span className="live-map-event-copy"><strong>{event.title}</strong><small>{event.location} · {KIND_LABELS[event.kind]}</small><small>{new Date(event.observedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</small></span>
              <span className={'live-map-status status-' + event.status}>{STATUS_LABELS[event.status]}</span>
            </button>
          ))}
          {visibleEvents.length === 0 && <p className="live-map-empty">No demo events match these filters. Turn on a layer or reset the view.</p>}
        </div>
      </section>

      <footer className="live-map-footer">NxHeal · Stage 1 interface prototype · Synthetic events only · No live feeds, official alerts or personal health records</footer>
    </main>
  );
}
