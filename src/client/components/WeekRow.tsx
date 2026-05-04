import React from "react";
import { Week } from "../hooks/useWeeks";
import { DOW, fmtDateLong, fmtRange, fmtMD, isHoliday, holidayName } from "../utils/dates";
import { money } from "../utils/money";
import { ChevronRight, Check, Copy, Plus, X, Trash, Clock } from "./icons";

interface Props {
  week: Week;
  isOpen: boolean;
  onToggleOpen: () => void;
  onChange: (next: Week) => void;
  onDuplicateDown: () => void;
  onSkipToggle: () => void;
  onClearWeek: () => void;
}

export default function WeekRow({ week, onChange, onDuplicateDown, onSkipToggle, onClearWeek, isOpen, onToggleOpen }: Props) {
  const ws = week.startDate;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    return d;
  });
  const totalH = week.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0);
  const subtotal = totalH * week.rate;
  const hst = week.hstOn ? subtotal * (week.hstRate / 100) : 0;
  const total = subtotal + hst;

  const status = week.committed ? "committed" : week.skipped ? "skipped" : totalH > 0 ? "ready" : "draft";
  const statusLabel = { committed: "Committed", skipped: "Skipped", ready: "Ready", draft: "Draft" }[status];

  const setHour = (i: number, v: number) => {
    const next = [...week.hours];
    next[i] = v;
    onChange({ ...week, hours: next });
  };

  return (
    <div className={"week " + (isOpen ? "is-open " : "") + (week.skipped ? "is-skipped " : "")}>
      <div className="week__head" onClick={onToggleOpen} role="button" aria-expanded={isOpen}>
        <span className="week__caret"><ChevronRight size={18} /></span>
        <div>
          <div className="week__title">Week of {fmtDateLong(ws)}</div>
          <div className="week__sub">{fmtRange(ws)}{week.note ? " · " + week.note : ""}</div>
        </div>
        <span className={"week__chip week__chip--" + status}>
          {(status === "committed" || status === "ready") && <Check size={12} />}
          {statusLabel}
          {status === "committed" && week.qbId && <span style={{ opacity: 0.7, marginLeft: 4 }}>&middot; {week.qbId}</span>}
        </span>
        <span className="week__hours">{totalH.toFixed(1)} h</span>
        <span className="week__amount">{money(total)}</span>
        <button className="week__menu" onClick={(e) => { e.stopPropagation(); onDuplicateDown(); }} title="Copy this week's hours to following weeks">
          <Copy size={16} />
        </button>
        <button className="week__menu" onClick={(e) => { e.stopPropagation(); onSkipToggle(); }} title={week.skipped ? "Restore week" : "Skip this week"}>
          {week.skipped ? <Plus size={16} /> : <X size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="week__body">
          <div className="quickset">
            <span className="quickset__label">Quick set:</span>
            <button className="qpill" onClick={() => onChange({ ...week, hours: [0, 7.5, 7.5, 7.5, 7.5, 7.5, 0] })}>Mon–Fri 7.5h</button>
            <button className="qpill" onClick={() => onChange({ ...week, hours: [0, 8, 8, 8, 8, 8, 0] })}>Mon–Fri 8h</button>
            <button className="qpill" onClick={() => onChange({ ...week, hours: [0, 8, 8, 8, 8, 4, 0] })}>Mon–Thu 8h, Fri 4h</button>
            <button className="qpill" onClick={() => onChange({ ...week, hours: [0, 0, 0, 0, 0, 0, 0] })}>Clear</button>
            <span className="spacer" />
            <span className="quickset__label">Pay code:</span>
            <select value={week.payCode || "Regular Time"} onChange={(e) => onChange({ ...week, payCode: e.target.value })}
              style={{ padding: "5px 10px", border: "1px solid var(--ax-border)", borderRadius: 999, fontSize: 12, background: "white" }}>
              <option>Regular Time</option>
              <option>Overtime 1.5&times;</option>
              <option>Stat Holiday</option>
              <option>Travel</option>
            </select>
          </div>

          <div className="daygrid" role="grid">
            <div className="daygrid__header">
              <div>{week.item || "Line item"}</div>
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
                <div className="lbl">{week.client}</div>
                <div className="meta">{week.project} &middot; {week.payCode || "Regular Time"}</div>
              </div>
              {week.hours.map((h, i) => {
                const we = i === 0 || i === 6;
                const num = parseFloat(String(h)) || 0;
                return (
                  <div key={i} className={"daygrid__cell " + (we ? "we" : "")}>
                    <input
                      type="number" min="0" max="24" step="0.25"
                      className={"hourinput " + (num === 0 ? "zero" : "")}
                      value={h === 0 ? "" : h}
                      placeholder="0"
                      disabled={week.committed || week.skipped}
                      onChange={(e) => setHour(i, e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                    />
                  </div>
                );
              })}
              <div className="daygrid__cell daygrid__cell--total">{totalH.toFixed(1)}</div>
            </div>
          </div>

          <div className="note-row">
            <Clock size={16} className="muted" />
            <input type="text" placeholder="Optional note for this week's invoice"
              value={week.note || ""} onChange={(e) => onChange({ ...week, note: e.target.value })} disabled={week.committed} />
          </div>

          <div className="weekfoot">
            <div className="weekfoot__totals">
              <span><span className="key">Hours</span><span className="val">{totalH.toFixed(2)}</span></span>
              <span><span className="key">Subtotal</span><span className="val">{money(subtotal)}</span></span>
              <span><span className="key">HST {week.hstOn ? `(${week.hstRate}%)` : "(off)"}</span><span className="val">{money(hst)}</span></span>
              <span><span className="key">Invoice</span><span className="val grand">{money(total)}</span></span>
            </div>
            <div className="weekfoot__actions">
              <button className="btn btn--text btn--sm" onClick={onDuplicateDown}>
                <Copy size={14} /> Copy down
              </button>
              {!week.committed && (
                <button className="btn btn--ghost btn--sm" onClick={onClearWeek}>
                  <Trash size={14} /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
