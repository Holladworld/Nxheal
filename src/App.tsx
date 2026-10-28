import { FormEvent, useEffect, useState } from 'react';

type EpisodeStatus = 'ongoing' | 'improving' | 'recovered';

type Episode = {
  id: string;
  symptoms: string[];
  onsetDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  suspectedCondition: string;
  status: EpisodeStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'nxheal.episodes.v1';
const symptomChoices = ['Fever', 'Headache', 'Cough', 'Body aches', 'Tiredness', 'Nausea', 'Diarrhoea', 'Sore throat', 'Other'];

function readEpisodes(): Episode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as Episode[] : [];
  } catch {
    return [];
  }
}

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
  const [episodes, setEpisodes] = useState<Episode[]>(readEpisodes);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [onsetDate, setOnsetDate] = useState(todayLocal);
  const [severity, setSeverity] = useState<Episode['severity']>('moderate');
  const [notes, setNotes] = useState('');
  const [suspectedCondition, setSuspectedCondition] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

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
    if (selectedSymptoms.length === 0) {
      setMessage('Choose at least one symptom before saving.');
      return;
    }
    if (!onsetDate || onsetDate > todayLocal()) {
      setMessage('Choose a valid start date that is not in the future.');
      return;
    }

    const timestamp = new Date().toISOString();
    const episode: Episode = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `episode-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      symptoms: selectedSymptoms,
      onsetDate,
      severity,
      notes: notes.trim(),
      suspectedCondition: suspectedCondition.trim(),
      status: 'ongoing',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setEpisodes((current) => [episode, ...current]);
    setSelectedSymptoms([]);
    setOnsetDate(todayLocal());
    setSeverity('moderate');
    setNotes('');
    setSuspectedCondition('');
    setMessage('Your health episode has been saved on this device.');
    setShowForm(false);
  }

  function updateStatus(id: string, status: EpisodeStatus) {
    const timestamp = new Date().toISOString();
    setEpisodes((current) => current.map((episode) => episode.id === id
      ? { ...episode, status, updatedAt: timestamp }
      : episode));
    setMessage(status === 'recovered' ? 'Episode marked as recovered.' : 'Episode updated.');
  }

  function deleteEpisode(id: string) {
    setEpisodes((current) => current.filter((episode) => episode.id !== id));
    setMessage('Episode deleted from this device.');
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="NxHeal home">
          <span className="brand-mark" aria-hidden="true">n</span>
          <span>NxHeal</span>
        </a>
        <span className="prototype-label">EARLY PROTOTYPE</span>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> YOUR HEALTH, IN CONTEXT</p>
          <h1 id="hero-title">Your health journey, <em>understood.</em></h1>
          <p className="hero-description">
            Keep track of how you feel, notice changes over time, and prepare
            for more informed conversations about your health.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => { setShowForm(true); setMessage(''); }} type="button">
              Record how you feel <span aria-hidden="true">↗</span>
            </button>
            <a className="quiet-note" href="#history">View my health history ↓</a>
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
                <div className="episode-meta"><span>{episode.severity[0].toUpperCase() + episode.severity.slice(1)} severity</span>{episode.suspectedCondition && <span>Suspected: {episode.suspectedCondition}</span>}</div>
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

      <footer className="page-footer">
        <p><strong>Important:</strong> NxHeal is a prototype for tracking personal health experiences. It does not diagnose conditions or replace professional medical care. Seek urgent medical help for severe or rapidly worsening symptoms.</p>
        <span>NXHEAL · BUILT WITH CARE</span>
      </footer>
    </main>
  );
}