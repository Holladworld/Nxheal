import { useEffect, useState, type FormEvent } from 'react';
import { validateEpisodeInput } from './episodeRules.mjs';
import { removeEpisode, updateEpisodeStatus } from './episodeState.mjs';
import { buildHealthSummary } from './healthSummary.mjs';
import { readEpisodesFromStorage } from './episodeStorage.mjs';
import { applySmallGroupSuppression, evaluatePopulationSignal } from './populationSignals.mjs';

type EpisodeStatus = 'ongoing' | 'improving' | 'recovered';

type Episode = {
  id: string;
  symptoms: string[];
  onsetDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  suspectedCondition: string;
  reportedCondition: string;
  status: EpisodeStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'nxheal.episodes.v1';
const symptomChoices = ['Fever', 'Headache', 'Cough', 'Body aches', 'Tiredness', 'Dizziness', 'Chest pain', 'Shortness of breath', 'Abdominal pain', 'Nausea', 'Diarrhoea', 'Sore throat', 'Injury', 'Skin changes', 'Other'];

// Fictional demonstration data only. Never treat these as real or live reports.
const syntheticReports = (count: number, period: string) => Array.from({ length: count }, (_, index) => ({
  id: `synthetic-${period}-${index + 1}`,
  unitId: 'demo-community-01',
  reportedAt: period === 'current' ? `2026-10-${String(20 + (index % 7)).padStart(2, '0')}T12:00:00Z` : `2026-10-${String(1 + (index % 7)).padStart(2, '0')}T12:00:00Z`,
  symptoms: index % 2 === 0 ? ['Dizziness', 'Headache'] : ['Tiredness'],
}));
const syntheticCurrentReports = syntheticReports(10, 'current');
const syntheticBaselineReports = syntheticReports(5, 'baseline');
const syntheticSignal = evaluatePopulationSignal({
  currentReports: syntheticCurrentReports,
  baselineReports: syntheticBaselineReports,
  secondarySignal: {
    label: 'Heat observation',
    sourceLabel: 'DEMO ONLY — synthetic environmental data',
    status: 'available',
    direction: 'elevated',
    observed: '38°C',
    baseline: '33°C',
  },
});
const syntheticCommunitySummary = applySmallGroupSuppression({ reportCount: syntheticCurrentReports.length }, 5);

function todayLocal(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function readableDate(value: string): string {
  if (!value) return 'Date not set';
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function App() {
  const [episodes, setEpisodes] = useState<Episode[]>(() => readEpisodesFromStorage(localStorage, STORAGE_KEY));
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [onsetDate, setOnsetDate] = useState(todayLocal);
  const [severity, setSeverity] = useState<Episode['severity']>('moderate');
  const [notes, setNotes] = useState('');
  const [suspectedCondition, setSuspectedCondition] = useState('');
  const [reportedCondition, setReportedCondition] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'record' | 'history' | 'summary'>('home');
  const [summaryDraft, setSummaryDraft] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [episodes]);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((current) => current.includes(symptom)
      ? current.filter((item) => item !== symptom)
      : [...current, symptom]);
  }

  function saveEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateEpisodeInput({
      selectedSymptoms,
      customSymptom,
      onsetDate,
      today: todayLocal(),
    });
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    const timestamp = new Date().toISOString();
    const episode: Episode = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `episode-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      symptoms: selectedSymptoms.flatMap((symptom) => symptom === 'Other' ? [customSymptom.trim()] : [symptom]),
      onsetDate,
      severity,
      notes: notes.trim(),
      suspectedCondition: suspectedCondition.trim(),
      reportedCondition: reportedCondition.trim(),
      status: 'ongoing',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setEpisodes((current) => [episode, ...current]);
    setSelectedSymptoms([]);
    setCustomSymptom('');
    setOnsetDate(todayLocal());
    setSeverity('moderate');
    setNotes('');
    setSuspectedCondition('');
    setReportedCondition('');
    setMessage('Your health episode has been saved on this device.');
    setShowForm(false);
  }

  function updateStatus(id: string, status: EpisodeStatus) {
    const timestamp = new Date().toISOString();
    setEpisodes((current) => updateEpisodeStatus(current, id, status, timestamp));
    setMessage(status === 'recovered' ? 'Episode marked as recovered.' : 'Episode updated.');
  }

  function createHealthSummary() {
    const generatedAt = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    const summary = buildHealthSummary(episodes, {
      preparedOn: generatedAt,
      formatOnsetDate: readableDate,
      formatUpdatedDate: (value) => new Date(value).toLocaleDateString(),
    });
    setSummaryDraft(summary);
    setShowSummary(true);
    setMessage('');
    window.setTimeout(() => document.getElementById('health-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  function downloadHealthSummary() {
    const blob = new Blob([summaryDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nxheal-personal-health-summary.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function deleteEpisode(id: string) {
    setEpisodes((current) => removeEpisode(current, id));
    setMessage('Episode deleted from this device.');
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="NxHeal home">
          <span className="brand-mark" aria-hidden="true">n</span>
          <span>NxHeal</span>
        </a>
        <span className="prototype-label"><span className="live-dot" /> HEALTH JOURNAL</span>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> YOUR PERSONAL HEALTH SPACE</p>
          <h1 id="hero-title">How are you <em>feeling today?</em></h1>
          <p className="hero-description">
            A simple place to record symptoms, follow changes, and keep your health story together.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => { setShowForm(true); setMessage(''); document.getElementById('report')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} type="button">
              <span aria-hidden="true">＋</span> Record symptoms
            </button>
            <a className="quiet-note" href="#history">My health history <span aria-hidden="true">→</span></a>\n            <a className="quiet-note" href="#community-health">Explore community demo <span aria-hidden="true">→</span></a>
          </div>
          <div className="trust-note">
            <span className="shield-icon" aria-hidden="true">◇</span>
            <p><strong>Your health belongs to you.</strong><br />This prototype stores your entries in this browser on this device. It does not send them to a server.</p>
          </div>
        </div>

        <aside className="journey-card" aria-label="NxHeal overview">
          <div className="card-topline">
            <span className="card-kicker">YOUR JOURNEY</span>
            <span className="preview-badge">PERSONAL RECORD</span>
          </div>
          <div className="journey-heading">
            <div>
              <p className="muted-label">A little check-in</p>
              <h2>How are you feeling?</h2>
            </div>
            <span className="sun-icon" aria-hidden="true">✳</span>
          </div>
          <p className="card-intro">Start with what you notice. You don't need to know what's causing it to record a symptom.</p>
          <div className="feeling-options">
            <button className="feeling-option" type="button" onClick={() => { setShowForm(true); setMessage(''); }}>
              <span className="feeling-symbol warm" aria-hidden="true">〜</span>
              <span><strong>I'm not feeling well</strong><small>Record a symptom or symptoms</small></span>
              <span className="option-arrow" aria-hidden="true">↗</span>
            </button>
            <a className="feeling-option" href="#history">
              <span className="feeling-symbol green" aria-hidden="true">＋</span>
              <span><strong>I'm feeling better</strong><small>Update an existing episode</small></span>
              <span className="option-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="card-footer"><span className="footer-line" /> <span>Small notes. A clearer picture.</span></div>
        </aside>
        <div className="decor decor-one" aria-hidden="true" />
        <div className="decor decor-two" aria-hidden="true" />
      </section>

      {showForm && (
        <section className="workspace-section" id="report" aria-labelledby="report-title">
          <div className="workspace-heading">
            <div><p className="eyebrow">PERSONAL HEALTH RECORD</p><h2 id="report-title">Record how you're feeling</h2></div>
            <button className="text-button" type="button" onClick={() => setShowForm(false)}>Close ×</button>
          </div>
          <p className="section-intro">Record what you notice, not a diagnosis. You can update this episode as things change.</p>
          <form className="episode-form" onSubmit={saveEpisode}>
            <fieldset className="symptom-fieldset">
              <legend>What are you experiencing? <span className="required-label">Choose at least one</span></legend>
              <div className="symptom-grid">
                {symptomChoices.map((symptom) => (
                  <label className={`symptom-chip ${selectedSymptoms.includes(symptom) ? 'selected' : ''}`} key={symptom}>
                    <input type="checkbox" checked={selectedSymptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} />
                    <span aria-hidden="true">{selectedSymptoms.includes(symptom) ? '✓' : '+'}</span>{symptom}
                  </label>
                ))}
              </div>
            </fieldset>
            {selectedSymptoms.includes('Other') && (
              <label className="form-field custom-symptom-field">Describe the other symptom
                <input type="text" value={customSymptom} onChange={(event) => setCustomSymptom(event.target.value)} maxLength={100} placeholder="Describe what you're experiencing" required />
              </label>
            )}
            {selectedSymptoms.some((symptom) => ['Chest pain', 'Shortness of breath'].includes(symptom)) && (
              <div className="safety-notice" role="alert">
                <strong>Please take this seriously.</strong> New, severe, or unexplained chest pain or difficulty breathing can be an emergency. Seek urgent medical assessment now, especially if symptoms are severe or worsening, or occur with sweating, faintness, or pain spreading to the arm, back, neck, or jaw. Do not wait for an app response.
              </div>
            )}
            <div className="form-grid">
              <label className="form-field">When did it start?
                <input type="date" value={onsetDate} max={todayLocal()} onChange={(event) => setOnsetDate(event.target.value)} required />
              </label>
              <label className="form-field">How severe does it feel?
                <select value={severity} onChange={(event) => setSeverity(event.target.value as Episode['severity'])}>
                  <option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option>
                </select>
              </label>
            </div>
            <label className="form-field">Do you suspect a particular illness? <span className="optional-label">Optional — not a diagnosis</span>
              <input type="text" value={suspectedCondition} onChange={(event) => setSuspectedCondition(event.target.value)} maxLength={100} placeholder="e.g. I wonder if this could be malaria" />
            </label>
            <label className="form-field">Have you been told you have a condition? <span className="optional-label">Optional — user-reported, not independently verified</span>
              <input type="text" value={reportedCondition} onChange={(event) => setReportedCondition(event.target.value)} maxLength={100} placeholder="e.g. a condition diagnosed by a healthcare professional" />
            </label>
            <label className="form-field">Anything else you'd like to note? <span className="optional-label">Optional</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3} placeholder="Add details you may want to remember…" />
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">Save health episode <span aria-hidden="true">↗</span></button>
              <span className="form-footnote">Saved locally in this browser on this device.</span>
            </div>
          </form>
        </section>
      )}

      <section className="workspace-section history-section" id="history" aria-labelledby="history-title">
        <div className="workspace-heading">
          <div><p className="eyebrow">YOUR PERSONAL TIMELINE</p><h2 id="history-title">Health history</h2></div>
          <span className="count-badge">{episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}</span>
        </div>
        {message && <p className="feedback-message" role="status">{message}</p>}
        {storageWarning && <p className="warning-message" role="alert">Your browser could not save these changes. Keep this page open and avoid entering sensitive details until storage is working.</p>}
        {episodes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">＋</span>
            <h3>Your timeline starts here</h3>
            <p>When you record a symptom, your health episode will appear here so you can return to it later.</p>
            <button className="secondary-button" type="button" onClick={() => { setShowForm(true); setMessage(''); }}>Record your first episode</button>
          </div>
        ) : (
          <div className="episode-list">
            {episodes.map((episode) => (
              <article className="episode-card" key={episode.id}>
                <div className="episode-top">
                  <div><p className="episode-date">STARTED {readableDate(episode.onsetDate)}</p><h3>{episode.symptoms.join(' · ')}</h3></div>
                  <span className={`status-badge status-${episode.status}`}>{episode.status === 'ongoing' ? 'Ongoing' : episode.status === 'improving' ? 'Improving' : 'Recovered'}</span>
                </div>
                <div className="episode-meta"><span>{episode.severity[0].toUpperCase() + episode.severity.slice(1)} severity</span>{episode.suspectedCondition && <span>Suspected: {episode.suspectedCondition}</span>}{episode.reportedCondition && <span>Reported condition: {episode.reportedCondition} (not independently verified)</span>}</div>
                {episode.notes && <p className="episode-notes">{episode.notes}</p>}
                <div className="episode-actions">
                  {episode.status !== 'improving' && <button type="button" className="small-action" onClick={() => updateStatus(episode.id, 'improving')}>I'm improving</button>}
                  {episode.status !== 'recovered' && <button type="button" className="small-action positive-action" onClick={() => updateStatus(episode.id, 'recovered')}>Mark recovered</button>}
                  {episode.status !== 'ongoing' && <button type="button" className="small-action" onClick={() => updateStatus(episode.id, 'ongoing')}>Reopen episode</button>}
                  <button type="button" className="small-action delete-action" onClick={() => { if (window.confirm('Delete this episode from this device? This cannot be undone.')) deleteEpisode(episode.id); }}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="workspace-section summary-section" id="health-summary" aria-labelledby="summary-title">
        <div className="workspace-heading">
          <div><p className="eyebrow">USER-CONTROLLED SHARING</p><h2 id="summary-title">Personal health summary</h2></div>
          <button className="secondary-button" type="button" onClick={createHealthSummary}>Prepare summary</button>
        </div>
        <p className="section-intro">Create a plain-language summary from your saved episodes. Review and edit it before downloading or sharing it yourself.</p>
        {showSummary ? (
          <div className="summary-editor">
            <label className="form-field" htmlFor="summary-draft">Review and edit your summary before sharing
              <textarea id="summary-draft" value={summaryDraft} onChange={(event) => setSummaryDraft(event.target.value)} rows={14} />
            </label>
            <p className="summary-privacy-note">The summary is prepared in this browser. NxHeal does not send it to anyone. Only download or share it if you choose to.</p>
            <div className="form-actions">
              <button className="primary-button" type="button" onClick={downloadHealthSummary} disabled={!summaryDraft.trim()}>Download text summary</button>
              <button className="secondary-button" type="button" onClick={() => window.print()} disabled={!summaryDraft.trim()}>Print / Save as PDF</button>
              <button className="text-button" type="button" onClick={() => setShowSummary(false)}>Close summary</button>
            </div>
          </div>
        ) : (
          <div className="summary-prompt">
            <p>Your summary will separate symptoms, suspected conditions, and user-reported conditions, without adding a diagnosis.</p>
            <button className="secondary-button" type="button" onClick={createHealthSummary}>Prepare my summary</button>
          </div>
        )}
      </section>

      <section className="workspace-section community-section" id="community-health" aria-labelledby="community-health-title">
        <div className="workspace-heading">
          <div><p className="eyebrow">POPULATION HEALTH · PROTOTYPE</p><h2 id="community-health-title">Community signals</h2></div>
          <span className="preview-badge">DEMO DATA ONLY</span>
        </div>
        <p className="section-intro">This fictional example shows how reports from individuals might contribute to a community-level signal. No real people, live feeds, or personal health entries are used here.</p>
        <div className="trust-note community-demo-notice">
          <span className="shield-icon" aria-hidden="true">◇</span>
          <p><strong>Synthetic scenario — not a real alert.</strong><br />A demo community has more reports of dizziness, headache, and tiredness than its comparison period, alongside a fictional elevated heat observation.</p>
        </div>
        <div className="feature-grid community-metrics">
          <article className="feature-card"><span className="feature-number">01</span><h3>{syntheticCurrentReports.length} reports</h3><p>Current demo period</p></article>
          <article className="feature-card"><span className="feature-number">02</span><h3>{syntheticBaselineReports.length} reports</h3><p>Baseline demo period</p></article>
          <article className="feature-card"><span className="feature-number">03</span><h3>38°C vs 33°C</h3><p>Fictional heat observation; not a live measurement</p></article>
        </div>
        <div className="summary-prompt community-signal-result">
          <p className="eyebrow">RULE-BASED DEMO RESULT</p>
          <h3>{syntheticSignal.status === 'potential_signal_for_review' ? 'Potential pattern for human review' : 'No review signal'}</h3>
          <p>{syntheticSignal.explanation}</p>
          <p><strong>Geographic unit:</strong> Fictional community (not a real location)</p>
          <p><strong>Aggregate visibility:</strong> {syntheticCommunitySummary.status === 'available' ? 'Group size meets the demo minimum for an aggregate count.' : syntheticCommunitySummary.message}</p>
          <p><strong>Required next step:</strong> An authorised reviewer would inspect data quality, coverage, the baseline, missing data, and alternative explanations before deciding whether to investigate further.</p>
          <p className="summary-privacy-note">This is a simple demonstration rule, not validated epidemiological logic. It does not establish a diagnosis, outbreak, causal relationship, or official warning. The current app does not send personal reports to a central system.</p>
        </div>
      </section>

      <section className="features-section" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">A MORE HUMAN HEALTH RECORD</p>
          <h2>Understand the pattern, <em>not just the moment.</em></h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card"><span className="feature-number">01</span><h3>Record how you feel</h3><p>Keep a simple record of symptoms and when they started.</p></article>
          <article className="feature-card"><span className="feature-number">02</span><h3>Follow your progress</h3><p>Return to the same episode to note changes and recovery.</p></article>
          <article className="feature-card"><span className="feature-number">03</span><h3>Share on your terms</h3><p>Prepare a health summary you can review before sharing.</p></article>
        </div>
      </section>

      <nav className="mobile-tabbar" aria-label="Main navigation">
        <a href="#top" className={`mobile-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')} aria-current={activeTab === 'home' ? 'page' : undefined}><span aria-hidden="true">⌂</span><small>Home</small></a>
        <button type="button" className={`mobile-tab ${activeTab === 'record' ? 'active' : ''}`} onClick={() => { setActiveTab('record'); setShowForm(true); setMessage(''); window.setTimeout(() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }} aria-pressed={activeTab === 'record'}><span aria-hidden="true">＋</span><small>Record</small></button>
        <a href="#history" className={`mobile-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} aria-current={activeTab === 'history' ? 'page' : undefined}><span aria-hidden="true">▤</span><small>History</small></a>
        <a href="#health-summary" className={`mobile-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')} aria-current={activeTab === 'summary' ? 'page' : undefined}><span aria-hidden="true">♡</span><small>Summary</small></a>
      </nav>

      <footer className="page-footer">
        <p><strong>Important:</strong> NxHeal is a prototype for tracking personal health experiences. It does not diagnose conditions or replace professional medical care. Seek urgent medical help for severe or rapidly worsening symptoms.</p>
        <span>NXHEAL · BUILT WITH CARE</span>
      </footer>
    </main>
  );
}