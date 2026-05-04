// Login page — email magic link

function LoginPage({ onSent, onSubmitDemo }) {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c-1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

  const submit = (e) => {
    e && e.preventDefault();
    if (!validEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    // simulate network
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setResendCooldown(30);
    }, 700);
  };

  return (
    <div className="auth">
      <div className="auth__bg" aria-hidden="true">
        <div className="auth__bg-x">X</div>
      </div>

      <div className="auth__card">
        <div className="auth__brand">
          <span className="x">X</span>
          <span>adaptive<span style={{color:'var(--ax-golden)'}}>X</span> Books</span>
        </div>

        {!sent ? (
          <>
            <span className="eyebrow">Sign in</span>
            <h1 className="auth__title">Welcome back.</h1>
            <p className="auth__sub">We'll email you a one-time link. No password to remember.</p>

            <form onSubmit={submit} noValidate>
              <div className="field">
                <label className="field__label" htmlFor="email">Work email</label>
                <input
                  id="email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  placeholder="you@yourbusiness.ca"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'email-err' : undefined}
                />
                {error && <div id="email-err" className="auth__error" role="alert">{error}</div>}
              </div>

              <button type="submit" className="btn btn--primary" style={{width:'100%', padding:'14px 18px', fontSize:15, marginTop:8}} disabled={loading}>
                {loading ? <><Spinner/> Sending link…</> : <>Email me a sign-in link <ArrowRight size={16}/></>}
              </button>
            </form>

            <div className="auth__divider"><span>or</span></div>

            <button className="btn btn--ghost" style={{width:'100%'}} onClick={onSubmitDemo}>
              <Sparkle size={14}/> Continue with demo account
            </button>

            <p className="auth__legal">
              By signing in you agree to the <a href="#">Terms</a> and <a href="#">Privacy Notice</a> (PIPEDA / Quebec Law 25).
            </p>
          </>
        ) : (
          <>
            <div className="auth__icon-wrap" aria-hidden="true">
              <Mail size={28}/>
            </div>
            <h1 className="auth__title">Check your inbox.</h1>
            <p className="auth__sub">
              We sent a sign-in link to <strong style={{color:'var(--ax-fg-1)'}}>{email}</strong>. It's good for 15 minutes. You can close this tab — the link opens a new session.
            </p>

            <div className="auth__steps" role="list">
              <div className="auth__step" role="listitem"><span className="auth__step-num">1</span><div>Open the email from <strong>noreply@adaptivex.ca</strong></div></div>
              <div className="auth__step" role="listitem"><span className="auth__step-num">2</span><div>Click <strong>Sign in to adaptiveX Books</strong></div></div>
              <div className="auth__step" role="listitem"><span className="auth__step-num">3</span><div>You're in. Your invoice drafts are waiting.</div></div>
            </div>

            <div className="auth__row">
              <button className="btn btn--ghost" onClick={() => { setSent(false); }}>
                Use a different email
              </button>
              <button
                className="btn btn--text"
                disabled={resendCooldown > 0}
                onClick={() => { setResendCooldown(30); }}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend link'}
              </button>
            </div>

            {/* Demo affordance — pretend the link arrived */}
            <div className="auth__demo">
              <span className="auth__demo-label">Demo</span>
              <span style={{flex:1, fontSize:13, color:'var(--ax-fg-2)'}}>Skip the inbox and pretend you clicked the link.</span>
              <button className="btn btn--yellow btn--sm" onClick={() => onSent(email)}>
                <Check size={14}/> Open link
              </button>
            </div>
          </>
        )}
      </div>

      <div className="auth__foot">
        <span>© 2026 adaptiveX</span>
        <span className="auth__foot-sep">·</span>
        <a href="#">Help</a>
        <span className="auth__foot-sep">·</span>
        <a href="#">Status</a>
        <span className="auth__foot-sep">·</span>
        <span className="auth__foot-locale">EN · <a href="#">FR</a></span>
      </div>
    </div>
  );
}

// Spinner + Mail icons
const Spinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{animation:'spin 800ms linear infinite'}}>
    <path d="M21 12a9 9 0 1 1-6.4-8.6"/>
  </svg>
);
const Mail = (p) => <Icon {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></Icon>;

window.LoginPage = LoginPage;
window.Mail = Mail;
window.Spinner = Spinner;
