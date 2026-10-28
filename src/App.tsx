const features = [
  {
    number: '01',
    title: 'Record how you feel',
    description: 'Keep a simple record of symptoms and when they started.',
  },
  {
    number: '02',
    title: 'Follow your progress',
    description: 'Return to the same episode to note changes and recovery.',
  },
  {
    number: '03',
    title: 'Share on your terms',
    description: 'Prepare a health summary you can review before sharing.',
  },
];

export default function App() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="NxHeal home">
          <span className="brand-mark" aria-hidden="true">n</span>
          <span>NxHeal</span>
        </a>
        <span className="prototype-label">EARLY PROTOTYPE</span>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> YOUR HEALTH, IN CONTEXT</p>
          <h1 id="hero-title">Your health journey, <em>understood.</em></h1>
          <p className="hero-description">
            A calmer way to keep track of how you feel, notice changes over time,
            and prepare to have more informed conversations about your health.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#how-it-works">Explore the approach <span aria-hidden="true">↗</span></a>
            <span className="quiet-note">Personal health, at your pace.</span>
          </div>
          <div className="trust-note">
            <span className="shield-icon" aria-hidden="true">◇</span>
            <p><strong>Your health belongs to you.</strong><br />You should be able to understand and control what you choose to share.</p>
          </div>
        </div>

        <aside className="journey-card" aria-label="Example health journey preview">
          <div className="card-topline">
            <span className="card-kicker">YOUR JOURNEY</span>
            <span className="preview-badge">PREVIEW</span>
          </div>
          <div className="journey-heading">
            <div>
              <p className="muted-label">A little check-in</p>
              <h2>How are you feeling?</h2>
            </div>
            <span className="sun-icon" aria-hidden="true">✳</span>
          </div>
          <p className="card-intro">Your experience can change from day to day. Start with what you notice.</p>
          <div className="feeling-options" aria-label="Example check-in choices">
            <div className="feeling-option"><span className="feeling-symbol warm" aria-hidden="true">〜</span><span><strong>Not feeling well</strong><small>Record a symptom</small></span><span className="option-arrow" aria-hidden="true">↗</span></div>
            <div className="feeling-option"><span className="feeling-symbol green" aria-hidden="true">＋</span><span><strong>Feeling better</strong><small>Update an episode</small></span><span className="option-arrow" aria-hidden="true">↗</span></div>
          </div>
          <div className="card-footer"><span className="footer-line" /> <span>Small notes. A clearer picture.</span></div>
        </aside>
        <div className="decor decor-one" aria-hidden="true" />
        <div className="decor decor-two" aria-hidden="true" />
      </section>

      <section className="features-section" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">A MORE HUMAN HEALTH RECORD</p>
          <h2>Understand the pattern, <em>not just the moment.</em></h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <span className="feature-number">{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="page-footer">
        <p><strong>Important:</strong> NxHeal is a prototype for tracking personal health experiences. It does not diagnose conditions or replace professional medical care.</p>
        <span>NXHEAL · BUILT WITH CARE</span>
      </footer>
    </main>
  );
}