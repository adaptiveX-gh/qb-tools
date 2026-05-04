// Commit modal — review + confirm dialog before pushing to QuickBooks

function CommitModal({ open, weeks, tpl, onClose, onConfirm }) {
  if (!open) return null;
  const ready = weeks.filter(w => {
    if (w.skipped || w.committed) return false;
    const h = w.hours.reduce((a,b)=>a+(parseFloat(b)||0),0);
    return h > 0;
  });
  const subtotal = ready.reduce((a,w) => {
    const h = w.hours.reduce((x,y)=>x+(parseFloat(y)||0),0);
    return a + h * w.rate;
  }, 0);
  const hst = tpl.hstOn ? subtotal * (tpl.hstRate/100) : 0;
  const total = subtotal + hst;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="cmtitle">
        <div className="modal__head">
          <span className="eyebrow">Commit to QuickBooks Online</span>
          <h2 className="modal__title" id="cmtitle" style={{marginTop:6}}>Send {ready.length} {ready.length === 1 ? 'invoice' : 'invoices'}?</h2>
          <p className="modal__sub">Drafts and skipped weeks won't be sent. Each week becomes a separate invoice in QuickBooks.</p>
        </div>
        <div className="modal__body">
          <div className="invlist">
            <div className="invlist__row head">
              <div>Invoice</div>
              <div>Hours</div>
              <div>Subtotal</div>
              <div>Total</div>
            </div>
            {ready.map((w,i) => {
              const h = w.hours.reduce((x,y)=>x+(parseFloat(y)||0),0);
              const sub = h * w.rate;
              const t = sub + (w.hstOn ? sub * (w.hstRate/100) : 0);
              return (
                <div className="invlist__row" key={i}>
                  <div className="invlist__num">
                    INV-{String(1247 + i).padStart(4,'0')}
                    <small>{fmtRange(w.startDate)}</small>
                  </div>
                  <div className="amt">{h.toFixed(1)} h</div>
                  <div className="amt">{money(sub)}</div>
                  <div className="amt">{money(t)}</div>
                </div>
              );
            })}
          </div>

          <div style={{marginTop:16, padding:'14px 16px', background:'var(--ax-bg-2)', borderRadius:12, border:'1px solid var(--ax-border)'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6}}>
              <span className="muted">Subtotal</span><span style={{fontWeight:500}}>{money(subtotal)}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6}}>
              <span className="muted">HST {tpl.hstOn ? `(${tpl.hstRate}%)` : '(off)'}</span><span style={{fontWeight:500}}>{money(hst)}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:600, paddingTop:8, borderTop:'1px dashed var(--ax-border)'}}>
              <span>Total to QuickBooks</span><span style={{fontFamily:'var(--ax-font-display)', color:'var(--ax-purple-blue)'}}>{money(total)}</span>
            </div>
          </div>

          <div style={{marginTop:14, display:'flex', alignItems:'center', gap:10, fontSize:13, color:'var(--ax-fg-2)'}}>
            <Lock size={14} className="muted"/>
            Connected to <strong style={{color:'var(--ax-fg-1)'}}>QBO · Maple Civic Co.</strong> · 2 of 5 seats
          </div>
        </div>
        <div className="modal__foot">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={onConfirm}>
            <Check size={16}/> Send {ready.length} to QuickBooks
          </button>
        </div>
      </div>
    </div>
  );
}

window.CommitModal = CommitModal;
