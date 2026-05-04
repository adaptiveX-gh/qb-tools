import React, { useEffect, useState } from "react";
import { Template } from "../hooks/useWeeks";
import { searchCustomers } from "../services/customers";

interface Props {
  tpl: Template;
  setTpl: React.Dispatch<React.SetStateAction<Template>>;
  weekCount: number;
  setWeekCount: (n: number) => void;
  startDate: string;
  setStartDate: (s: string) => void;
}

export default function TemplatePanel({ tpl, setTpl, weekCount, setWeekCount, startDate, setStartDate }: Props) {
  const set = (k: keyof Template, v: any) => setTpl((t) => ({ ...t, [k]: v }));
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    searchCustomers()
      .then(setCustomers)
      .catch(() => {}); // silently fail if not connected yet
  }, []);

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <span className="eyebrow">Step 1 — Template</span>
          <h2 className="card__title" style={{ marginTop: 6 }}>The invoice you'll repeat</h2>
        </div>
      </div>
      <div className="card__body">
        <div className="field">
          <label className="field__label" htmlFor="client">Bill to (client)<span className="req">*</span></label>
          <select id="client" value={tpl.client} onChange={(e) => set("client", e.target.value)}>
            {customers.length > 0 ? (
              customers.map((c: any) => (
                <option key={c.Id} value={c.DisplayName}>{c.DisplayName}</option>
              ))
            ) : (
              <>
                <option>Transit Innovation Group</option>
                <option>FCBERT VMS – 97206</option>
                <option>Northwind Logistics</option>
                <option>Maple Civic Co.</option>
              </>
            )}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="proj">Project / engagement</label>
          <input id="proj" type="text" value={tpl.project} onChange={(e) => set("project", e.target.value)} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="item">Line item</label>
          <input id="item" type="text" value={tpl.item} onChange={(e) => set("item", e.target.value)} />
          <div className="field__hint">Shows up on every weekly invoice. You can override per week.</div>
        </div>

        <div className="field__row">
          <div className="field">
            <label className="field__label" htmlFor="rate">Hourly rate (CAD)<span className="req">*</span></label>
            <div className="input-prefix">
              <span>$</span>
              <input id="rate" type="number" min="0" step="0.01" value={tpl.rate}
                onChange={(e) => set("rate", parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="hst">HST</label>
            <div className="input-suffix">
              <span>%</span>
              <input id="hst" type="number" min="0" max="30" step="0.01" value={tpl.hstRate}
                onChange={(e) => set("hstRate", parseFloat(e.target.value) || 0)} />
            </div>
            <div className="field__hint">ON default 13%. Toggle off below if zero-rated.</div>
          </div>
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label className="toggle" style={{ display: "flex" }}>
            <span className={"toggle " + (tpl.hstOn ? "on" : "")} aria-hidden="true">
              <span className="toggle__track">
                <span className="toggle__thumb" />
              </span>
            </span>
            <input type="checkbox" checked={tpl.hstOn}
              onChange={(e) => set("hstOn", e.target.checked)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
            <span style={{ fontSize: 13 }}>Apply HST to invoices</span>
          </label>
          <div className="field__hint" style={{ marginLeft: 46 }}>HST # {tpl.hstNum}</div>
        </div>

        <hr className="hr" />

        <span className="eyebrow">Step 2 — Period</span>

        <div className="field" style={{ marginTop: 10 }}>
          <label className="field__label" htmlFor="start">Starting week (week of)<span className="req">*</span></label>
          <input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <div className="field__hint">Weeks run Sunday &rarr; Saturday.</div>
        </div>

        <div className="field">
          <label className="field__label">Number of weeks</label>
          <div className="quickset">
            {[2, 4, 6, 8, 12].map((n) => (
              <button key={n} className={"qpill " + (weekCount === n ? "active" : "")} onClick={() => setWeekCount(n)}>
                {n} weeks
              </button>
            ))}
            <input type="number" min="1" max="52" value={weekCount}
              onChange={(e) => setWeekCount(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
              style={{ width: 64, padding: "5px 10px", border: "1px solid var(--ax-border)", borderRadius: 999, fontSize: 12, textAlign: "center" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
