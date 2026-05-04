// SignedOut page — confirms sign-out, offers sign-in again

function SignedOutPage({ email, onSignInAgain }) {
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

        <div className="auth__icon-wrap auth__icon-wrap--good" aria-hidden="true">
          <Check size={28}/>
        </div>
        <h1 className="auth__title">You're signed out.</h1>
        <p className="auth__sub">
          {email ? <>Session ended for <strong style={{color:'var(--ax-fg-1)'}}>{email}</strong>. </> : null}
          Your drafts are saved. Anything not committed to QuickBooks stays here in adaptiveX Books.
        </p>

        <div className="auth__rememberlist">
          <div className="auth__remitem"><Check size={14} style={{color:'#2A7B3F'}}/> Drafts and templates saved</div>
          <div className="auth__remitem"><Check size={14} style={{color:'#2A7B3F'}}/> QuickBooks connection paused</div>
          <div className="auth__remitem"><Check size={14} style={{color:'#2A7B3F'}}/> No invoices were sent on signout</div>
        </div>

        <button className="btn btn--primary" style={{width:'100%', padding:'14px 18px', fontSize:15}} onClick={onSignInAgain}>
          Sign in again <ArrowRight size={16}/>
        </button>

        <p className="auth__legal" style={{marginTop:16}}>
          On a shared computer? <a href="#">Clear all session data</a> before you walk away.
        </p>
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

window.SignedOutPage = SignedOutPage;
