import { useEffect, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './lib/supabase';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError('We could not restore your sign-in session. Please try signing in again.');
      setSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage('');
    setError('');
    try {
      if (mode === 'sign-up') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (authError) throw authError;
        setMessage(data.session
          ? 'Your account is ready. Email confirmation may still be required by your project settings.'
          : 'Account request received. Check your email for the confirmation link before signing in.');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        setMessage('You are signed in. Your existing local journal has not been uploaded.');
        setPassword('');
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    setError('');
    setMessage('');
    const { error: authError } = await supabase.auth.signOut();
    if (authError) setError(authError.message);
    else setMessage('You have signed out. Your local journal remains on this device.');
    setBusy(false);
  }

  return (
    <section className="auth-panel" aria-label="NxHeal account">
      <div className="auth-panel-heading">
        <div>
          <p className="eyebrow">PRIVATE ACCOUNT</p>
          <h2>{session ? 'Your NxHeal account' : 'Sign in to NxHeal'}</h2>
        </div>
        {session && <span className="auth-state">SIGNED IN</span>}
      </div>

      {!isSupabaseConfigured ? (
        <p className="auth-notice">Account access is not configured in this development environment yet. Your local health journal remains available on this device.</p>
      ) : session ? (
        <div className="auth-signed-in">
          <p>Signed in as <strong>{session.user.email}</strong></p>
          <p className="auth-notice">Your journal is still stored locally. Signing in has not uploaded or shared any entries.</p>
          <button className="secondary-button" type="button" onClick={signOut} disabled={busy}>{busy ? 'Please wait…' : 'Sign out'}</button>
        </div>
      ) : (
        <>
          <p className="auth-notice">Use an email address and password. Your personal journal stays on this device until you explicitly choose a future cloud migration.</p>
          <div className="auth-mode-switch" role="group" aria-label="Account action">
            <button type="button" className={mode === 'sign-in' ? 'selected' : ''} onClick={() => { setMode('sign-in'); setMessage(''); setError(''); }}>Sign in</button>
            <button type="button" className={mode === 'sign-up' ? 'selected' : ''} onClick={() => { setMode('sign-up'); setMessage(''); setError(''); }}>Create account</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label className="form-field">Email address
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="form-field">Password
              <input type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            </label>
            <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
          </form>
        </>
      )}
      {message && <p className="auth-feedback" role="status">{message}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}
    </section>
  );
}
