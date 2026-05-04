import React, { useState } from "react";
import { Week, Template } from "../hooks/useWeeks";
import { fmtRange } from "../utils/dates";
import { money } from "../utils/money";
import { Lock, Check, Spinner } from "./icons";
import { bulkCreateInvoices, CreateInvoicePayload } from "../api/invoices";
import { useAuth } from "../hooks/useAuth";

interface Props {
  open: boolean;
  weeks: Week[];
  tpl: Template;
  onClose: () => void;
  onCommitted: (indices: number[], qbIds: (string | null)[]) => void;
}

export default function CommitModal({ open, weeks, tpl, onClose, onCommitted }: Props) {
  const { companyName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const readyEntries = weeks
    .map((w, i) => ({ week: w, index: i }))
    .filter(({ week }) => {
      if (week.skipped || week.committed) return false;
      return week.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0) > 0;
    });

  const subtotal = readyEntries.reduce((a, { week }) => {
    const h = week.hours.reduce((x, y) => x + (parseFloat(String(y)) || 0), 0);
    return a + h * week.rate;
  }, 0);
  const hst = tpl.hstOn ? subtotal * (tpl.hstRate / 100) : 0;
  const total = subtotal + hst;

  const handleCommit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build invoice payloads
      const invoices: CreateInvoicePayload[] = readyEntries.map(({ week }) => {
        const h = week.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0);
        return {
          customer_ref: week.client, // In a real integration this would be the QB customer ID
          line_items: [{
            item_ref: "1", // placeholder — would be real QB item ID
            qty: h,
            unit_price: week.rate,
            description: `${week.item} — ${fmtRange(week.startDate)}`,
          }],
          txn_date: week.startDate.toISOString().split("T")[0],
        };
      });

      const result = await bulkCreateInvoices(invoices);
      const indices = readyEntries.map(({ index }) => index);
      const qbIds = result.results.map((r) =>
        r.success && r.invoice ? `INV-${r.invoice.DocNumber || r.invoice.Id}` : null
      );

      onCommitted(indices, qbIds);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create invoices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__head">
          <span className="eyebrow">Commit to QuickBooks Online</span>
          <h2 className="modal__title" style={{ marginTop: 6 }}>
            Send {readyEntries.length} {readyEntries.length === 1 ? "invoice" : "invoices"}?
          </h2>
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
            {readyEntries.map(({ week }, i) => {
              const h = week.hours.reduce((x, y) => x + (parseFloat(String(y)) || 0), 0);
              const sub = h * week.rate;
              const t = sub + (week.hstOn ? sub * (week.hstRate / 100) : 0);
              return (
                <div className="invlist__row" key={i}>
                  <div className="invlist__num">
                    Week {i + 1}
                    <small>{fmtRange(week.startDate)}</small>
                  </div>
                  <div className="amt">{h.toFixed(1)} h</div>
                  <div className="amt">{money(sub)}</div>
                  <div className="amt">{money(t)}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--ax-bg-2)", borderRadius: 12, border: "1px solid var(--ax-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span className="muted">Subtotal</span><span style={{ fontWeight: 500 }}>{money(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span className="muted">HST {tpl.hstOn ? `(${tpl.hstRate}%)` : "(off)"}</span><span style={{ fontWeight: 500 }}>{money(hst)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 600, paddingTop: 8, borderTop: "1px dashed var(--ax-border)" }}>
              <span>Total to QuickBooks</span>
              <span style={{ fontFamily: "var(--ax-font-display)", color: "var(--ax-purple-blue)" }}>{money(total)}</span>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "#FDF1EE", border: "1px solid #F5C6CB", borderRadius: 8, color: "#C0392B", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ax-fg-2)" }}>
            <Lock size={14} className="muted" />
            Connected to <strong style={{ color: "var(--ax-fg-1)" }}>QBO &middot; {companyName || "Your Company"}</strong>
          </div>
        </div>
        <div className="modal__foot">
          <button className="btn btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn--primary" onClick={handleCommit} disabled={loading}>
            {loading ? <><Spinner /> Sending...</> : <><Check size={16} /> Send {readyEntries.length} to QuickBooks</>}
          </button>
        </div>
      </div>
    </div>
  );
}
