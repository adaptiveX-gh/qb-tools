// Summary sidebar — shows totals across all weeks + commit button

function SummaryPanel({ weeks, tpl, onCommit, onPreview, onExport, committedCount }) {
  const active = weeks.filter(w => !w.skipped);
  const totalHours = active.reduce((a,w) => a + w.hours.reduce((x,y)=>x+(parseFloat(y)||0),0), 0);
  const subtotal = totalHours * tpl.rate;
  const hst = tpl.hstOn ? subtotal * (tpl.hstRate/100) : 0;
  const total = subtotal + hst;

  const readyCount = active.filter(w => {
    const h = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
    return h > 0 && !w.committed;
  }).length;
  const draftCount = active.filter(w => {
    const h = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
    return h === 0 && !w.committed;
  }).length;

  return (
    <div className="card summary">
      <div className="card__header">
        <div>
          <span className="eyebrow">Step 3 — Review & commit</span>
          <h2 className="card__title" style={{marginTop:6}}>Run summary</h2>
        </div>
      </div>
      <div className="card__body">

        <div className="template-preview">
          <div className="lbl">Template</div>
          <div className="who">{tpl.client}</div>
          <div className="desc">{tpl.item} · {money(tpl.rate)}/hr · HST {tpl.hstOn ? `${tpl.hstRate}%` : 'off'}</div>
        </div>

        <div className="sumline">
          <span className="key">Weeks in run</span>
          <span className="val">{weeks.length}</span>
        </div>
        <div className="sumline">
          <span className="key">Active invoices</span>
          <span className="val">{active.length}{weeks.length - active.length > 0 && <span className="muted"> ({weeks.length-active.length} skipped)</span>}</span>
        </div>
        <div className="sumline">
          <span className="key">Total billable hours</span>
          <span className="val">{totalHours.toFixed(2)}</span>
        </div>
        <div className="sumline">
          <span className="key">Subtotal</span>
          <span className="val">{money(subtotal)}</span>
        </div>
        <div className="sumline">
          <span className="key">HST {tpl.hstOn ? `(${tpl.hstRate}%)` : '(off)'}</span>
          <span className="val">{money(hst)}</span>
        </div>
        <div className="sumline total">
          <span className="key">Total to commit</span>
          <span className="val">{money(total)}</span>
        </div>

        <hr className="hr" />

        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:12, fontSize:12}}>
          <span className="week__chip week__chip--ready"><Check size={11}/>{readyCount} ready</span>
          <span className="week__chip week__chip--draft">{draftCount} drafts</span>
          {committedCount > 0 && <span className="week__chip week__chip--committed"><Check size={11}/>{committedCount} committed</span>}
        </div>

        <button className="btn btn--yellow" style={{width:'100%', padding:'14px 18px', fontSize:15}}
                onClick={onCommit} disabled={readyCount === 0}>
          <Sparkle size={16}/> Commit {readyCount} {readyCount === 1 ? 'invoice' : 'invoices'} to QuickBooks
          <ArrowRight size={16}/>
        </button>

        <div style={{display:'flex', gap:8, marginTop:10}}>
          <button className="btn btn--ghost btn--sm" style={{flex:1}} onClick={onPreview}>
            <Eye size={14}/> Preview
          </button>
          <button className="btn btn--ghost btn--sm" style={{flex:1}} onClick={onExport}>
            <Download size={14}/> Export CSV
          </button>
        </div>

        <div className="field__hint" style={{marginTop:12, lineHeight:1.5}}>
          Drafts (zero hours) are skipped on commit. You can review or change anything in QuickBooks before sending.
        </div>
      </div>
    </div>
  );
}

window.SummaryPanel = SummaryPanel;
