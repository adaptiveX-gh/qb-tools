import React from "react";
import { Week } from "../hooks/useWeeks";
import { DOW, fmtDateLong, fmtRange, fmtMD, isHoliday, holidayName } from "../utils/dates";
import { money } from "../utils/money";
import { ChevronRight, Check, Copy, Plus, X, Trash, Clock, ArrowRight } from "./icons";

interface Props {
  weeks: Week[];
  idx: number;
  setIdx: (i: number) => void;
  onChange: (idx: number, next: Week) => void;
  onDuplicateDown: (idx: number) => void;
  onSkipToggle: (idx: number) => void;
  onClearWeek: (idx: number) => void;
}

export default function FocusView({ weeks, idx, setIdx, onChange, onDuplicateDown, onSkipToggle, onClearWeek }: Props) {
  const w = weeks[idx];
  const ws = w.startDate;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    return d;
  });
  const totalH = w.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0);
  const subtotal = totalH * w.rate;
  const hst = w.hstOn ? subtotal * (w.hstRate / 100) : 0;
  const total = subtotal + hst;
  const status = w.committed ? "committed" : w.skipped ? "skipped" : totalH > 0 ? "ready" : "draft";

  const setHour = (i: number, v: number) => {
    const next = [...w.hours];
    next[i] = v;
    onChange(idx, { ...w, hours: next });
  };

  const prev = () => setIdx(Math.max(0, idx - 1));
  const next = () => setIdx(Math.min(weeks.length - 1, idx + 1));

  return (
    <div className="focus-view">
      <div className="focus-stepper">
        <button className="btn btn--ghost btn--sm" onClick={prev} disabled={idx === 0}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Previous
        </button>
        <div className="focus-stepper__center">
          <div style={{ fontSize: 11, color: "var(--ax-fg-3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
            Week {idx + 1} of {weeks.length}
          </div>
          <div style={{ fontFamily: "var(--ax-font-display)", fontWeight: 600, fontSize: 20, marginTop: 2, color: "var(--ax-fg-1)" }}>
            {fmtRange(ws)}
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={"week__chip week__chip--" + status}>
              {(status === "committed" || status === "ready") && <Check size={12} />}
              {status[0].toUpperCase() + status.slice(1)}
              {status === "committed" && w.qbId && <span style={{ opacity: 0.7, marginLeft: 4 }}>&middot; {w.qbId}</span>}
            </span>
          </div>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={next} disabled={idx === weeks.length - 1}>
          Next <ChevronRight size={16} />
        </button>
      </div>

      <div className="focus-pips">
        {weeks.map((wk, i) => {
          const h = wk.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0);
          const s = wk.committed ? "committed" : wk.skipped ? "skipped" : h > 0 ? "ready" : "draft";
          return (
            <button key={i} className={"focus-pip " + (i === idx ? "is-current " : "") + "is-" + s}
              onClick={() => setIdx(i)} title={fmtRange(wk.startDate) + " · " + h.toFixed(1) + "h"}>
              <span className="focus-pip__num">W{i + 1}</span>
              <span className="focus-pip__date">{fmtRange(wk.startDate).split(",")[0]}</span>
              <span className="focus-pip__h">{h.toFixed(1)}h</span>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card__header">
          <div>
            <span className="eyebrow">Invoice for {fmtDateLong(ws)}</span>
            <h2 className="card__title" style={{ marginTop: 6 }}>{w.client} &middot; {w.project}</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn--text btn--sm" onClick={() => onDuplicateDown(idx)}>
              <Copy size={14} /> Copy to following weeks
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => onSkipToggle(idx)}>
              {w.skipped ? <Plus size={14} /> : <X size={14} />} {w.skipped ? "Restore" : "Skip"}
            </button>
          </div>
        </div>
        <div className="card__body" style={{ padding: 0 }}>
          <div className="quickset" style={{ padding: "14px 24px 0" }}>
            <span className="quickset__label">Quick set:</span>
            <button className="qpill" onClick={() => onChange(idx, { ...w, hours: [0, 7.5, 7.5, 7.5, 7.5, 7.5, 0] })}>Mon–Fri 7.5h</button>
            <button className="qpill" onClick={() => onChange(idx, { ...w, hours: [0, 8, 8, 8, 8, 8, 0] })}>Mon–Fri 8h</button>
            <button className="qpill" onClick={() => onChange(idx, { ...w, hours: [0, 8, 8, 8, 8, 4, 0] })}>Mon–Thu 8h, Fri 4h</button>
            <button className="qpill" onClick={() => onChange(idx, { ...w, hours: [0, 0, 0, 0, 0, 0, 0] })}>Clear</button>
          </div>

          <div style={{ padding: "14px 24px 24px" }}>
            <div className="daygrid" role="grid">
              <div className="daygrid__header">
                <div>{w.item || "Line item"}</div>
                {days.map((d, i) => {
                  const we = i === 0 || i === 6;
                  const hol = isHoliday(d);
                  return (
                    <div key={i} className={(we ? "we " : "") + (hol ? "holiday" : "")} title={hol ? holidayName(d) : ""}>
                      <span className="dow">{DOW[i]}{hol && <span className="star"> &#9733;</span>}</span>
                      <span className="dat">{fmtMD(d)}</span>
                    </div>
                  );
                })}
                <div>Total</div>
              </div>
              <div className="daygrid__row">
                <div className="daygrid__cell daygrid__cell--label">
                  <div className="lbl">{w.client}</div>
                  <div className="meta">{w.project} &middot; {w.payCode || "Regular Time"}</div>
                </div>
                {w.hours.map((h, i) => {
                  const we = i === 0 || i === 6;
                  const num = parseFloat(String(h)) || 0;
                  return (
                    <div key={i} className={"daygrid__cell " + (we ? "we" : "")}>
                      <input type="number" min="0" max="24" step="0.25"
                        className={"hourinput " + (num === 0 ? "zero" : "")}
                        value={h === 0 ? "" : h} placeholder="0"
                        disabled={w.committed || w.skipped}
                        onChange={(e) => setHour(i, e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)} />
                    </div>
                  );
                })}
                <div className="daygrid__cell daygrid__cell--total">{totalH.toFixed(1)}</div>
              </div>
            </div>

            <div className="note-row">
              <Clock size={16} className="muted" />
              <input type="text" placeholder="Optional note for this week"
                value={w.note || ""} disabled={w.committed}
                onChange={(e) => onChange(idx, { ...w, note: e.target.value })} />
            </div>

            <div className="weekfoot" style={{ marginTop: 16 }}>
              <div className="weekfoot__totals">
                <span><span className="key">Hours</span><span className="val">{totalH.toFixed(2)}</span></span>
                <span><span className="key">Subtotal</span><span className="val">{money(subtotal)}</span></span>
                <span><span className="key">HST {w.hstOn ? `(${w.hstRate}%)` : "(off)"}</span><span className="val">{money(hst)}</span></span>
                <span><span className="key">Invoice</span><span className="val grand">{money(total)}</span></span>
              </div>
              <div className="weekfoot__actions">
                {!w.committed && (
                  <button className="btn btn--ghost btn--sm" onClick={() => onClearWeek(idx)}>
                    <Trash size={14} /> Clear
                  </button>
                )}
                {idx < weeks.length - 1 && (
                  <button className="btn btn--primary btn--sm" onClick={next}>
                    Next week <ArrowRight size={14} />
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
