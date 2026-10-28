import { buildSyntheticEarlyWarningDemo } from './syntheticEarlyWarningDemo.mjs';

type DemoData = {
  demoOnly: boolean;
  title: string;
  geography: { level: string; code: string; label: string };
  period: { current: string; baseline: string };
  signals: {
    symptomReports: { currentCount: number; baselineCount: number; synthetic: boolean };
    environment: {
      type: string;
      current: { value: number | null; unit: string; qualityStatus: string; observedAt: string; sourceName: string; qualityNotes: string } | null;
      baseline: { value: number | null; unit: string; qualityStatus: string; observedAt: string; sourceName: string; qualityNotes: string } | null;
      comparisonAvailable: boolean;
      direction: string;
    };
  };
  evaluation: {
    status: string;
    currentCount: number;
    baselineCount: number;
    multiplier: number | null;
    explanation: string;
    requiresHumanReview: boolean;
  };
  coverage: { realWorldCoverage: string; missingOrDelayedData: boolean };
  reviewerGuidance: string[];
};

const demo = buildSyntheticEarlyWarningDemo() as DemoData;

function dateLabel(value: string | undefined): string {
  if (!value) return 'Time not available';
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
}

export default function ReviewerDemo() {
  const [reviewNote, setReviewNote] = useState('');
  const [reviewState, setReviewState] = useState<'not-reviewed' | 'needs-data' | 'escalate-review'>('not-reviewed');
  const resultLabel: Record<string, string> = {
    potential_signal_for_review: 'Potential pattern — human review only',
    review_not_triggered: 'No review trigger from available evidence',
    no_pattern_detected: 'No pattern detected by demo rule',
    insufficient_data: 'Insufficient data',
  };
  const current = demo.signals.environment.current;
  const baseline = demo.signals.environment.baseline;

  return (
    <main className="reviewer-shell">
      <header className="reviewer-header">
        <a className="brand" href="./" aria-label="Return to NxHeal health journal"><span className="brand-mark" aria-hidden="true">n</span><span>NxHeal</span></a>
        <a className="reviewer-back" href="./">Return to personal journal ↗</a>
      </header>
      <section className="reviewer-hero">
        <p className="eyebrow">SEPARATE REVIEWER DEMONSTRATION</p>
        <h1>Early-warning <em>scenario review</em></h1>
        <p>This is a fictional training scenario for exploring how a symptom-report pattern and an environmental observation might be reviewed together.</p>
        <div className="reviewer-demo-warning" role="note"><strong>DEMO DATA ONLY</strong><span>No real people, location, health reports, sensors, or live feeds are represented. Nothing here is an official alert or a clinical conclusion.</span></div>
      </section>

      <section className="reviewer-panel" aria-labelledby="scenario-title">
        <div className="reviewer-panel-heading"><div><p className="eyebrow">SCENARIO CONTEXT</p><h2 id="scenario-title">{demo.title}</h2></div><span className="reviewer-pill">Synthetic</span></div>
        <div className="reviewer-facts"><div><span>Geographic unit</span><strong>{demo.geography.label}</strong></div><div><span>Comparison</span><strong>{demo.period.baseline} vs {demo.period.current}</strong></div><div><span>Live coverage</span><strong>Not available</strong></div></div>
      </section>

      <section className="reviewer-metrics" aria-label="Fictional signal comparison">
        <article className="reviewer-metric"><span>Symptom reports · baseline</span><strong>{demo.signals.symptomReports.baselineCount}</strong><small>Fictional reports</small></article>
        <article className="reviewer-metric"><span>Symptom reports · current</span><strong>{demo.signals.symptomReports.currentCount}</strong><small>Fictional reports</small></article>
        <article className="reviewer-metric"><span>Illustrative change</span><strong>{demo.evaluation.multiplier === null ? 'N/A' : `${demo.evaluation.multiplier}×`}</strong><small>Not a validated threshold</small></article>
      </section>

      <section className="reviewer-panel" aria-labelledby="environment-title">
        <div className="reviewer-panel-heading"><div><p className="eyebrow">SECONDARY OBSERVATION</p><h2 id="environment-title">Environmental context · heat</h2></div><span className={current && ['valid', 'estimated'].includes(current.qualityStatus) ? 'reviewer-pill' : 'reviewer-pill reviewer-pill-muted'}>{current?.qualityStatus ?? 'unavailable'}</span></div>
        <div className="reviewer-facts"><div><span>Fictional baseline</span><strong>{baseline?.value ?? '—'} {baseline?.unit ?? ''}</strong><small>{dateLabel(baseline?.observedAt)}</small></div><div><span>Fictional current reading</span><strong>{current?.value ?? 'Unavailable'} {current?.unit ?? ''}</strong><small>{dateLabel(current?.observedAt)}</small></div><div><span>Provenance</span><strong>{current?.sourceName ?? 'No usable observation'}</strong><small>{current?.qualityNotes ?? 'No quality notes available.'}</small></div></div>
        {!demo.signals.environment.comparisonAvailable && <p className="reviewer-inline-warning">The environmental comparison is unavailable or not comparable. Do not treat missing data as zero or as evidence that conditions are normal.</p>}
      </section>

      <section className="reviewer-result" aria-labelledby="result-title">
        <p className="eyebrow">RULE OUTPUT · NOT A PUBLIC ALERT</p>
        <h2 id="result-title">{resultLabel[demo.evaluation.status] ?? 'Result needs interpretation'}</h2>
        <p>{demo.evaluation.explanation}</p>
        <p className="reviewer-result-caution">A co-occurring pattern does not prove causation. This simple illustrative rule is not an epidemiologically validated detector and cannot confirm an outbreak or diagnose anyone.</p>
      </section>

      <section className="reviewer-panel" aria-labelledby="checks-title">
        <p className="eyebrow">BEFORE ANY REAL-WORLD ACTION</p><h2 id="checks-title">Reviewer checklist</h2>
        <ul className="reviewer-checklist">{demo.reviewerGuidance.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="reviewer-panel" aria-labelledby="decision-title">
        <p className="eyebrow">LOCAL TRAINING EXERCISE</p><h2 id="decision-title">Record a demo review outcome</h2>
        <p className="reviewer-muted">This selection stays in this page session only. It is not sent, saved to a server, or treated as an official decision.</p>
        <label className="reviewer-field">Training outcome<select value={reviewState} onChange={(event) => setReviewState(event.target.value as typeof reviewState)}><option value="not-reviewed">Not reviewed yet</option><option value="needs-data">Request more evidence</option><option value="escalate-review">Recommend authorised human review</option></select></label>
        <label className="reviewer-field">Reviewer notes (fictional only)<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={1000} placeholder="Note data-quality questions or what should be verified next." /></label>
        <div className="reviewer-review-state" role="status">{reviewState === 'not-reviewed' ? 'No review outcome selected.' : reviewState === 'needs-data' ? 'Training outcome: request more evidence.' : 'Training outcome: recommend authorised human review; this does not issue an alert.'}{reviewNote.trim() ? ' Notes entered locally for this session.' : ''}</div>
      </section>
      <footer className="reviewer-footer">NxHeal prototype · synthetic data · no personal journal access · no live reporting or alerting</footer>
    </main>
  );
}

import { useState } from 'react';
