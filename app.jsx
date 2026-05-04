// Main app — Bulk Invoice Creator

const { useState, useMemo, useEffect } = React;

const DEFAULT_TPL = {
  client: 'Transit Innovation Group',
  project: 'Strategy & Modernization',
  item: 'Senior consulting — billable hours',
  rate: 165,
  hstOn: true,
  hstRate: 13,
  hstNum: '81234 5678 RT0001',
};

function makeWeek(startDate, tpl, defaults = {}) {
  return {
    startDate,
    hours: defaults.hours || [0, 7.5, 7.5, 7.5, 7.5, 7.5, 0],
    note: defaults.note || '',
    payCode: defaults.payCode || 'Regular Time',
    skipped: false,
    committed: false,
    qbId: null,
    // snapshot of template at creation time (so editing template later is explicit)
    client: tpl.client,
    project: tpl.project,
    item: tpl.item,
    rate: tpl.rate,
    hstOn: tpl.hstOn,
    hstRate: tpl.hstRate,
  };
}

function App() {
  // Auth state — 'signed-in' | 'signed-out' | 'logged-out-confirm'
  const [authState, setAuthState] = useState('signed-out');
  const [authEmail, setAuthEmail] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const onMagicLinkOpened = (email) => {
    setAuthEmail(email || 'carlos@maplecivic.ca');
    setAuthState('signed-in');
  };
  const onDemo = () => {
    setAuthEmail('demo@adaptivex.ca');
    setAuthState('signed-in');
  };
  const onSignOut = () => {
    setUserMenuOpen(false);
    setAuthState('logged-out-confirm');
  };
  const onSignInAgain = () => {
    setAuthState('signed-out');
  };

  // close menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const h = (e) => {
      if (!e.target.closest('.usermenu') && !e.target.closest('.user-chip')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [userMenuOpen]);

  if (authState === 'signed-out') {
    return <LoginPage onSent={onMagicLinkOpened} onSubmitDemo={onDemo} />;
  }
  if (authState === 'logged-out-confirm') {
    return <SignedOutPage email={authEmail} onSignInAgain={onSignInAgain} />;
  }

  return <SignedInApp authEmail={authEmail} onSignOut={onSignOut} userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen} />;
}

function SignedInApp({ authEmail, onSignOut, userMenuOpen, setUserMenuOpen }) {
  const [tpl, setTpl] = useState(DEFAULT_TPL);
  const [startDate, setStartDate] = useState('2026-04-26');
  const [weekCount, setWeekCount] = useState(6);
  const [weeks, setWeeks] = useState(() => {
    const wks = buildWeeks('2026-04-26', 6);
    return wks.map(ws => makeWeek(ws, DEFAULT_TPL));
  });
  const [openIdx, setOpenIdx] = useState(0);
  const [showCommit, setShowCommit] = useState(false);
  const [committedBanner, setCommittedBanner] = useState(null); // {count, total}
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list'); // list | focus | grid
  const [focusIdx, setFocusIdx] = useState(0);

  // Re-build weeks when start date or count changes (preserve existing data where possible)
  useEffect(() => {
    const wks = buildWeeks(startDate, weekCount);
    setWeeks(prev => wks.map((ws, i) => {
      const existing = prev.find(w => isoDate(w.startDate) === isoDate(ws));
      if (existing) return { ...existing, startDate: ws };
      return makeWeek(ws, tpl);
    }));
  }, [startDate, weekCount]);

  // When the template changes, propagate to non-committed weeks
  useEffect(() => {
    setWeeks(prev => prev.map(w => w.committed ? w : ({
      ...w,
      client: tpl.client,
      project: tpl.project,
      item: tpl.item,
      rate: tpl.rate,
      hstOn: tpl.hstOn,
      hstRate: tpl.hstRate,
    })));
  }, [tpl]);

  const updateWeek = (idx, next) => {
    setWeeks(ws => ws.map((w,i) => i === idx ? next : w));
  };

  const duplicateDown = (idx) => {
    setWeeks(ws => ws.map((w,i) => {
      if (i <= idx || w.committed) return w;
      return { ...w, hours: [...ws[idx].hours], payCode: ws[idx].payCode, note: ws[idx].note };
    }));
    setCommittedBanner({ kind: 'copy', count: weeks.length - idx - 1, idx });
  };

  const skipToggle = (idx) => {
    setWeeks(ws => ws.map((w,i) => i === idx ? ({ ...w, skipped: !w.skipped }) : w));
  };

  const clearWeek = (idx) => {
    setWeeks(ws => ws.map((w,i) => i === idx ? ({ ...w, hours: [0,0,0,0,0,0,0], note: '' }) : w));
  };

  const applyToAllFromFirst = () => {
    setWeeks(ws => {
      const first = ws[0];
      return ws.map((w,i) => i === 0 || w.committed ? w : ({ ...w, hours: [...first.hours], payCode: first.payCode }));
    });
  };

  const onCommit = () => setShowCommit(true);

  const onConfirmCommit = () => {
    const readyIdxs = weeks.map((w, i) => {
      if (w.skipped || w.committed) return null;
      const h = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
      return h > 0 ? i : null;
    }).filter(x => x !== null);

    let qbStart = 1247;
    setWeeks(ws => ws.map((w, i) => {
      if (!readyIdxs.includes(i)) return w;
      const k = readyIdxs.indexOf(i);
      return { ...w, committed: true, qbId: 'INV-' + String(qbStart + k).padStart(4,'0') };
    }));

    const total = readyIdxs.reduce((a, i) => {
      const w = weeks[i];
      const h = w.hours.reduce((x,y)=>x+(parseFloat(y)||0),0);
      const sub = h * w.rate;
      return a + sub + (w.hstOn ? sub * (w.hstRate/100) : 0);
    }, 0);

    setShowCommit(false);
    setCommittedBanner({ kind: 'commit', count: readyIdxs.length, total });
  };

  // search filter
  const filteredIdxs = useMemo(() => {
    if (!search.trim()) return weeks.map((_, i) => i);
    const s = search.toLowerCase();
    return weeks.map((w, i) => {
      const txt = (fmtRange(w.startDate) + ' ' + (w.note||'') + ' ' + (w.qbId||'') + ' ' + w.client).toLowerCase();
      return txt.includes(s) ? i : null;
    }).filter(x => x !== null);
  }, [search, weeks]);

  const committedCount = weeks.filter(w => w.committed).length;

  return (
    <div className="app">
      <header className="topnav">
        <div className="topnav__brand">
          <span className="x">X</span>
          <span>adaptive<span style={{color:'var(--ax-golden)'}}>X</span> Books</span>
        </div>
        <div className="topnav__crumbs">
          <span>Invoicing</span>
          <span className="sep">/</span>
          <span className="cur">Bulk weekly invoices</span>
        </div>
        <div className="topnav__right">
          <span className="qb-pill"><span className="dot"/> QuickBooks connected</span>
          <button className="user-chip" onClick={() => setUserMenuOpen(o => !o)} aria-haspopup="menu" aria-expanded={userMenuOpen} style={{cursor:'pointer'}}>
            <span className="avatar">{(authEmail || 'CO').slice(0,2).toUpperCase()}</span>
            <span style={{maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{authEmail || 'Carlos Oliveira'}</span>
            <ChevronDown size={14} className="user-chip__caret"/>
          </button>
          {userMenuOpen && (
            <div className="usermenu" role="menu">
              <div className="usermenu__header">
                <div className="usermenu__name">Signed in as</div>
                <div className="usermenu__email">{authEmail}</div>
              </div>
              <button className="usermenu__item" role="menuitem"><Eye size={14}/> View profile</button>
              <button className="usermenu__item" role="menuitem"><Lock size={14}/> Security & sessions</button>
              <button className="usermenu__item" role="menuitem"><Sparkle size={14}/> QuickBooks connection</button>
              <div className="usermenu__sep"/>
              <button className="usermenu__item usermenu__item--danger" role="menuitem" onClick={onSignOut}>
                <ArrowRight size={14}/> Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="page">
        <div className="page__header">
          <div>
            <span className="eyebrow">Bulk invoice creator</span>
            <h1 className="page__title">Bill {weeks.length} weeks at once</h1>
            <p className="page__sub">Set up your weekly invoice once, fill the hours grid like a timesheet, then commit the whole run to QuickBooks. Skip weeks you don't bill, copy hours forward, and keep HST math automatic.</p>
          </div>
          <div className="page__actions">
            <button className="btn btn--ghost"><Calendar size={16}/> Apr 26 – Jun 6, 2026</button>
          </div>
        </div>

        {committedBanner && committedBanner.kind === 'commit' && (
          <div className="committed-banner">
            <span className="committed-banner__icon"><Check size={20}/></span>
            <div>
              <div className="committed-banner__title">{committedBanner.count} invoices sent to QuickBooks · {money(committedBanner.total)}</div>
              <div className="committed-banner__sub">They appear in QBO as drafts so you can review before sending to the client. Refunds & ReFILE-style edits stay on QuickBooks' side.</div>
            </div>
            <button className="committed-banner__close" onClick={() => setCommittedBanner(null)}><X size={18}/></button>
          </div>
        )}

        <div className="stats">
          <div className="stat">
            <div className="stat__label">Weeks</div>
            <div className="stat__value">{weeks.length}</div>
            <div className="stat__sub">{weeks.filter(w => !w.skipped && !w.committed).length} drafts · {committedCount} committed</div>
          </div>
          <div className="stat">
            <div className="stat__label">Total hours</div>
            <div className="stat__value">{weeks.reduce((a,w) => a + (w.skipped ? 0 : w.hours.reduce((x,y)=>x+(parseFloat(y)||0),0)),0).toFixed(1)}</div>
            <div className="stat__sub">across active weeks</div>
          </div>
          <div className="stat">
            <div className="stat__label">Subtotal</div>
            <div className="stat__value">{money(weeks.reduce((a,w) => a + (w.skipped ? 0 : w.hours.reduce((x,y)=>x+(parseFloat(y)||0),0) * w.rate),0))}</div>
            <div className="stat__sub">before HST</div>
          </div>
          <div className="stat stat--yellow">
            <div className="stat__label">Total billable</div>
            <div className="stat__value">{money(weeks.reduce((a,w) => {
              if (w.skipped) return a;
              const h = w.hours.reduce((x,y)=>x+(parseFloat(y)||0),0);
              const sub = h * w.rate;
              return a + sub + (w.hstOn ? sub * (w.hstRate/100) : 0);
            }, 0))}</div>
            <div className="stat__sub">incl. HST</div>
          </div>
        </div>

        <div className="layout">
          <TemplatePanel
            tpl={tpl} setTpl={setTpl}
            weekCount={weekCount} setWeekCount={setWeekCount}
            startDate={startDate} setStartDate={setStartDate}
          />

          <div>
            <div className="toolbar">
              <div className="toolbar__left">
                <div className="searchbox">
                  <Search size={16}/>
                  <input type="text" placeholder="Search weeks, notes, INV#…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn btn--ghost btn--sm" onClick={applyToAllFromFirst}>
                  <Copy size={14}/> Copy week 1 to all
                </button>
              </div>
              <div className="toolbar__right">
                <span className="muted" style={{fontSize:12}}>* Statutory holiday</span>
                <div className="seg" role="tablist">
                  <button className={view==='focus'?'active':''} onClick={() => setView('focus')}>One week</button>
                  <button className={view==='list'?'active':''} onClick={() => setView('list')}>All weeks</button>
                  <button className={view==='grid'?'active':''} onClick={() => setView('grid')}>Compare</button>
                </div>
              </div>
            </div>

            {view === 'list' && (
              <div className="weeks">
                {filteredIdxs.map(i => (
                  <WeekRow
                    key={i}
                    week={weeks[i]}
                    isOpen={openIdx === i}
                    onToggleOpen={() => setOpenIdx(openIdx === i ? -1 : i)}
                    onChange={next => updateWeek(i, next)}
                    onDuplicateDown={() => duplicateDown(i)}
                    onSkipToggle={() => skipToggle(i)}
                    onClearWeek={() => clearWeek(i)}
                  />
                ))}
                {filteredIdxs.length === 0 && (
                  <div style={{padding:48, textAlign:'center', background:'white', border:'1px dashed var(--ax-border)', borderRadius:12}}>
                    <div className="muted">No weeks match "{search}"</div>
                  </div>
                )}
              </div>
            )}
            {view === 'focus' && (
              <FocusView
                weeks={weeks}
                idx={Math.min(focusIdx, weeks.length-1)}
                setIdx={setFocusIdx}
                onChange={updateWeek}
                onDuplicateDown={duplicateDown}
                onSkipToggle={skipToggle}
                onClearWeek={clearWeek}
              />
            )}
            {view === 'grid' && (
              <CompareView weeks={weeks} onChange={updateWeek} />
            )}
          </div>
        </div>
      </main>

      <CommitModal
        open={showCommit}
        weeks={weeks}
        tpl={tpl}
        onClose={() => setShowCommit(false)}
        onConfirm={onConfirmCommit}
      />

      {/* Floating commit summary - always visible on scroll */}
      <FloatingCommit
        weeks={weeks}
        tpl={tpl}
        onCommit={onCommit}
        committedCount={committedCount}
      />
    </div>
  );
}

// Compare view — all weeks side by side as columns
function CompareView({ weeks, onChange }) {
  return (
    <div style={{background:'white', border:'1px solid var(--ax-border)', borderRadius:12, padding:18, overflowX:'auto'}}>
      <div style={{display:'grid', gridTemplateColumns:`160px repeat(${weeks.length}, minmax(140px, 1fr))`, gap:8, fontSize:13}}>
        {/* header row */}
        <div></div>
        {weeks.map((w,i) => (
          <div key={i} style={{padding:'8px 10px', background:'var(--ax-bg-2)', borderRadius:8, fontSize:12}}>
            <div style={{fontWeight:600, color:'var(--ax-fg-1)'}}>Wk {i+1}</div>
            <div className="muted" style={{fontSize:11, marginTop:2}}>{fmtDateShort(w.startDate)}</div>
          </div>
        ))}

        {DOW.map((dow, di) => (
          <React.Fragment key={dow}>
            <div style={{padding:'10px 10px', fontWeight:500, color:'var(--ax-fg-2)', borderTop:'1px solid var(--ax-border)'}}>{DOW_LONG[di]}</div>
            {weeks.map((w, wi) => {
              const d = new Date(w.startDate); d.setDate(d.getDate()+di);
              const we = (di === 0 || di === 6);
              const num = parseFloat(w.hours[di])||0;
              return (
                <div key={wi} style={{padding:6, background: we ? '#FAFAFD' : 'white', borderTop:'1px solid var(--ax-border)', borderRadius: 0}}>
                  <input
                    type="number" min="0" max="24" step="0.25"
                    className={'hourinput ' + (num === 0 ? 'zero' : '')}
                    value={w.hours[di] === 0 ? '' : w.hours[di]}
                    placeholder="0"
                    disabled={w.committed || w.skipped}
                    onChange={e => {
                      const next = [...w.hours];
                      next[di] = e.target.value === '' ? 0 : parseFloat(e.target.value)||0;
                      onChange(wi, { ...w, hours: next });
                    }}
                  />
                </div>
              );
            })}
          </React.Fragment>
        ))}

        {/* total row */}
        <div style={{padding:'10px', fontWeight:600, color:'var(--ax-fg-1)', borderTop:'2px solid var(--ax-border)'}}>Total hours</div>
        {weeks.map((w, wi) => {
          const h = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
          return (
            <div key={wi} style={{padding:'10px', borderTop:'2px solid var(--ax-border)', textAlign:'center', fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{h.toFixed(1)}</div>
          );
        })}

        {/* invoice row */}
        <div style={{padding:'10px', fontWeight:500, color:'var(--ax-fg-2)'}}>Invoice (incl HST)</div>
        {weeks.map((w, wi) => {
          const h = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
          const sub = h * w.rate;
          const t = sub + (w.hstOn ? sub * (w.hstRate/100) : 0);
          return (
            <div key={wi} style={{padding:'10px', textAlign:'center', color:'var(--ax-purple-blue)', fontWeight:600, fontFamily:'var(--ax-font-display)', fontVariantNumeric:'tabular-nums'}}>{money(t)}</div>
          );
        })}

        {/* status row */}
        <div style={{padding:'10px', fontWeight:500, color:'var(--ax-fg-2)'}}>Status</div>
        {weeks.map((w, wi) => {
          const h = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
          const status = w.committed ? 'committed' : (w.skipped ? 'skipped' : (h > 0 ? 'ready' : 'draft'));
          return (
            <div key={wi} style={{padding:'8px', textAlign:'center'}}>
              <span className={'week__chip week__chip--' + status} style={{fontSize:11}}>
                {status === 'committed' && <Check size={11}/>}{status === 'ready' && <Check size={11}/>}
                {status[0].toUpperCase()+status.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FloatingCommit({ weeks, tpl, onCommit, committedCount }) {
  const ready = weeks.filter(w => {
    if (w.skipped || w.committed) return false;
    const h = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
    return h > 0;
  });
  const total = ready.reduce((a, w) => {
    const h = w.hours.reduce((x,y)=>x+(parseFloat(y)||0),0);
    const sub = h * w.rate;
    return a + sub + (w.hstOn ? sub * (w.hstRate/100) : 0);
  }, 0);

  // also render the side summary inside the layout via the same data, but as a separate sticky block:
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:50,
      display: ready.length === 0 ? 'none' : 'flex',
      alignItems:'center', gap:14,
      background:'white',
      border:'1px solid var(--ax-border)',
      borderRadius:'var(--ax-radius-pill)',
      boxShadow:'var(--ax-shadow-lg)',
      padding:'8px 8px 8px 22px',
    }}>
      <div style={{fontSize:13, color:'var(--ax-fg-2)'}}>
        <strong style={{color:'var(--ax-fg-1)'}}>{ready.length}</strong> ready · <strong style={{color:'var(--ax-fg-1)', fontFamily:'var(--ax-font-display)'}}>{money(total)}</strong>
      </div>
      <button className="btn btn--yellow" onClick={onCommit}>
        <Sparkle size={16}/> Commit to QuickBooks <ArrowRight size={16}/>
      </button>
    </div>
  );
}

function FocusView({ weeks, idx, setIdx, onChange, onDuplicateDown, onSkipToggle, onClearWeek }) {
  const w = weeks[idx];
  const ws = w.startDate;
  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(ws); d.setDate(ws.getDate()+i); return d;
  });
  const totalH = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
  const subtotal = totalH * w.rate;
  const hst = w.hstOn ? subtotal * (w.hstRate/100) : 0;
  const total = subtotal + hst;
  const status = w.committed ? 'committed' : (w.skipped ? 'skipped' : (totalH > 0 ? 'ready' : 'draft'));

  const setHour = (i, v) => {
    const next = [...w.hours]; next[i] = v;
    onChange(idx, { ...w, hours: next });
  };

  const prev = () => setIdx(Math.max(0, idx-1));
  const next = () => setIdx(Math.min(weeks.length-1, idx+1));

  return (
    <div className="focus-view">
      {/* week stepper */}
      <div className="focus-stepper">
        <button className="btn btn--ghost btn--sm" onClick={prev} disabled={idx===0}>
          <ChevronRight size={16} style={{transform:'rotate(180deg)'}}/> Previous
        </button>
        <div className="focus-stepper__center">
          <div style={{fontSize:11, color:'var(--ax-fg-3)', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:600}}>
            Week {idx+1} of {weeks.length}
          </div>
          <div style={{fontFamily:'var(--ax-font-display)', fontWeight:600, fontSize:20, marginTop:2, color:'var(--ax-fg-1)'}}>
            {fmtRange(ws)}
          </div>
          <div style={{marginTop:6}}>
            <span className={'week__chip week__chip--' + status}>
              {(status === 'committed' || status === 'ready') && <Check size={12}/>}
              {status[0].toUpperCase()+status.slice(1)}
              {status === 'committed' && w.qbId && <span style={{opacity:0.7, marginLeft:4}}>· {w.qbId}</span>}
            </span>
          </div>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={next} disabled={idx===weeks.length-1}>
          Next <ChevronRight size={16}/>
        </button>
      </div>

      {/* week pips */}
      <div className="focus-pips">
        {weeks.map((wk, i) => {
          const h = wk.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
          const s = wk.committed ? 'committed' : (wk.skipped ? 'skipped' : (h > 0 ? 'ready' : 'draft'));
          return (
            <button key={i}
              className={'focus-pip ' + (i===idx ? 'is-current ' : '') + 'is-' + s}
              onClick={() => setIdx(i)}
              title={fmtRange(wk.startDate) + ' · ' + h.toFixed(1) + 'h'}>
              <span className="focus-pip__num">W{i+1}</span>
              <span className="focus-pip__date">{fmtDateShort(wk.startDate)}</span>
              <span className="focus-pip__h">{h.toFixed(1)}h</span>
            </button>
          );
        })}
      </div>

      {/* card */}
      <div className="card" style={{marginTop:16}}>
        <div className="card__header">
          <div>
            <span className="eyebrow">Invoice for {fmtDateLong(ws)}</span>
            <h2 className="card__title" style={{marginTop:6}}>{w.client} · {w.project}</h2>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn--text btn--sm" onClick={() => onDuplicateDown(idx)}>
              <Copy size={14}/> Copy to following weeks
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => onSkipToggle(idx)}>
              {w.skipped ? <Plus size={14}/> : <X size={14}/>} {w.skipped ? 'Restore' : 'Skip'}
            </button>
          </div>
        </div>
        <div className="card__body" style={{padding:0}}>
          <div className="quickset" style={{padding:'14px 24px 0'}}>
            <span className="quickset__label">Quick set:</span>
            <button className="qpill" onClick={() => onChange(idx, { ...w, hours: [0,7.5,7.5,7.5,7.5,7.5,0] })}>Mon–Fri 7.5h</button>
            <button className="qpill" onClick={() => onChange(idx, { ...w, hours: [0,8,8,8,8,8,0] })}>Mon–Fri 8h</button>
            <button className="qpill" onClick={() => onChange(idx, { ...w, hours: [0,8,8,8,8,4,0] })}>Mon–Thu 8h, Fri 4h</button>
            <button className="qpill" onClick={() => onChange(idx, { ...w, hours: [0,0,0,0,0,0,0] })}>Clear</button>
          </div>

          <div style={{padding:'14px 24px 24px'}}>
            <div className="daygrid" role="grid">
              <div className="daygrid__header">
                <div>{w.item || 'Line item'}</div>
                {days.map((d,i) => {
                  const we = (i === 0 || i === 6);
                  const hol = isHoliday(d);
                  return (
                    <div key={i} className={(we ? 'we ' : '') + (hol ? 'holiday' : '')} title={hol ? holidayName(d) : ''}>
                      <span className="dow">{DOW[i]}{hol && <span className="star"> ★</span>}</span>
                      <span className="dat">{fmtMD(d)}</span>
                    </div>
                  );
                })}
                <div>Total</div>
              </div>
              <div className="daygrid__row">
                <div className="daygrid__cell daygrid__cell--label">
                  <div className="lbl">{w.client}</div>
                  <div className="meta">{w.project} · {w.payCode || 'Regular Time'}</div>
                </div>
                {w.hours.map((h, i) => {
                  const we = (i === 0 || i === 6);
                  const num = parseFloat(h) || 0;
                  return (
                    <div key={i} className={'daygrid__cell ' + (we ? 'we' : '')}>
                      <input
                        type="number" min="0" max="24" step="0.25"
                        className={'hourinput ' + (num === 0 ? 'zero' : '')}
                        value={h === 0 ? '' : h}
                        placeholder="0"
                        disabled={w.committed || w.skipped}
                        onChange={e => setHour(i, e.target.value === '' ? 0 : parseFloat(e.target.value)||0)}
                      />
                    </div>
                  );
                })}
                <div className="daygrid__cell daygrid__cell--total">{totalH.toFixed(1)}</div>
              </div>
            </div>

            <div className="note-row">
              <Clock size={16} className="muted"/>
              <input type="text" placeholder="Optional note for this week"
                value={w.note || ''}
                disabled={w.committed}
                onChange={e => onChange(idx, { ...w, note: e.target.value })} />
            </div>

            <div className="weekfoot" style={{marginTop:16}}>
              <div className="weekfoot__totals">
                <span><span className="key">Hours</span><span className="val">{totalH.toFixed(2)}</span></span>
                <span><span className="key">Subtotal</span><span className="val">{money(subtotal)}</span></span>
                <span><span className="key">HST {w.hstOn ? `(${w.hstRate}%)` : '(off)'}</span><span className="val">{money(hst)}</span></span>
                <span><span className="key">Invoice</span><span className="val grand">{money(total)}</span></span>
              </div>
              <div className="weekfoot__actions">
                {!w.committed && (
                  <button className="btn btn--ghost btn--sm" onClick={() => onClearWeek(idx)}>
                    <Trash size={14}/> Clear
                  </button>
                )}
                {idx < weeks.length-1 && (
                  <button className="btn btn--primary btn--sm" onClick={next}>
                    Next week <ArrowRight size={14}/>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.App = App;
window.FocusView = FocusView;