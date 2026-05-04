import React from "react";
import { Week } from "../hooks/useWeeks";
import { DOW, DOW_LONG, fmtDateShort } from "../utils/dates";
import { money } from "../utils/money";
import { Check } from "./icons";

interface Props {
  weeks: Week[];
  onChange: (idx: number, next: Week) => void;
}

export default function CompareView({ weeks, onChange }: Props) {
  return (
    <div style={{ background: "white", border: "1px solid var(--ax-border)", borderRadius: 12, padding: 18, overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${weeks.length}, minmax(140px, 1fr))`, gap: 8, fontSize: 13 }}>
        <div></div>
        {weeks.map((w, i) => (
          <div key={i} style={{ padding: "8px 10px", background: "var(--ax-bg-2)", borderRadius: 8, fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: "var(--ax-fg-1)" }}>Wk {i + 1}</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{fmtDateShort(w.startDate)}</div>
          </div>
        ))}

        {DOW.map((dow, di) => (
          <React.Fragment key={dow}>
            <div style={{ padding: "10px 10px", fontWeight: 500, color: "var(--ax-fg-2)", borderTop: "1px solid var(--ax-border)" }}>{DOW_LONG[di]}</div>
            {weeks.map((w, wi) => {
              const we = di === 0 || di === 6;
              const num = parseFloat(String(w.hours[di])) || 0;
              return (
                <div key={wi} style={{ padding: 6, background: we ? "#FAFAFD" : "white", borderTop: "1px solid var(--ax-border)" }}>
                  <input type="number" min="0" max="24" step="0.25"
                    className={"hourinput " + (num === 0 ? "zero" : "")}
                    value={w.hours[di] === 0 ? "" : w.hours[di]} placeholder="0"
                    disabled={w.committed || w.skipped}
                    onChange={(e) => {
                      const next = [...w.hours];
                      next[di] = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                      onChange(wi, { ...w, hours: next });
                    }} />
                </div>
              );
            })}
          </React.Fragment>
        ))}

        <div style={{ padding: "10px", fontWeight: 600, color: "var(--ax-fg-1)", borderTop: "2px solid var(--ax-border)" }}>Total hours</div>
        {weeks.map((w, wi) => {
          const h = w.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0);
          return <div key={wi} style={{ padding: "10px", borderTop: "2px solid var(--ax-border)", textAlign: "center", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{h.toFixed(1)}</div>;
        })}

        <div style={{ padding: "10px", fontWeight: 500, color: "var(--ax-fg-2)" }}>Invoice (incl HST)</div>
        {weeks.map((w, wi) => {
          const h = w.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0);
          const sub = h * w.rate;
          const t = sub + (w.hstOn ? sub * (w.hstRate / 100) : 0);
          return <div key={wi} style={{ padding: "10px", textAlign: "center", color: "var(--ax-purple-blue)", fontWeight: 600, fontFamily: "var(--ax-font-display)", fontVariantNumeric: "tabular-nums" }}>{money(t)}</div>;
        })}

        <div style={{ padding: "10px", fontWeight: 500, color: "var(--ax-fg-2)" }}>Status</div>
        {weeks.map((w, wi) => {
          const h = w.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0);
          const status = w.committed ? "committed" : w.skipped ? "skipped" : h > 0 ? "ready" : "draft";
          return (
            <div key={wi} style={{ padding: "8px", textAlign: "center" }}>
              <span className={"week__chip week__chip--" + status} style={{ fontSize: 11 }}>
                {(status === "committed" || status === "ready") && <Check size={11} />}
                {status[0].toUpperCase() + status.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
