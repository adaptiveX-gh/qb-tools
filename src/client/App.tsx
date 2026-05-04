import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useWeeks, Template } from "./hooks/useWeeks";
import { fmtRange } from "./utils/dates";
import { money } from "./utils/money";
import LoginPage from "./components/LoginPage";
import SignedOutPage from "./components/SignedOutPage";
import TemplatePanel from "./components/TemplatePanel";
import WeekRow from "./components/WeekRow";
import CommitModal from "./components/CommitModal";
import SummaryPanel from "./components/SummaryPanel";
import FocusView from "./components/FocusView";
import CompareView from "./components/CompareView";
import { ChevronDown, Search, Copy, Calendar, Check, X, Sparkle, ArrowRight, Eye, Lock } from "./components/icons";

const DEFAULT_TPL: Template = {
  client: "Transit Innovation Group",
  project: "Strategy & Modernization",
  item: "Senior consulting — billable hours",
  rate: 165,
  hstOn: true,
  hstRate: 13,
  hstNum: "81234 5678 RT0001",
};

export default function App() {
  const { connected, loading, companyName, logout } = useAuth();
  const [loggedOut, setLoggedOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const h = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".usermenu") && !(e.target as HTMLElement).closest(".user-chip")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [userMenuOpen]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "var(--ax-font-body)", color: "var(--ax-fg-3)" }}>
        Loading...
      </div>
    );
  }

  if (loggedOut) {
    return <SignedOutPage onSignInAgain={() => { setLoggedOut(false); window.location.reload(); }} />;
  }

  if (!connected) {
    return <LoginPage />;
  }

  return (
    <SignedInApp
      companyName={companyName}
      onSignOut={async () => { await logout(); setLoggedOut(true); }}
      userMenuOpen={userMenuOpen}
      setUserMenuOpen={setUserMenuOpen}
    />
  );
}

function SignedInApp({ companyName, onSignOut, userMenuOpen, setUserMenuOpen }: {
  companyName: string | null;
  onSignOut: () => void;
  userMenuOpen: boolean;
  setUserMenuOpen: (v: boolean) => void;
}) {
  const [tpl, setTpl] = useState<Template>(DEFAULT_TPL);
  const [startDate, setStartDate] = useState("2026-04-26");
  const [weekCount, setWeekCount] = useState(6);
  const { weeks, updateWeek, duplicateDown, skipToggle, clearWeek, applyToAllFromFirst, markCommitted, readyWeeks } = useWeeks(startDate, weekCount, tpl);

  const [openIdx, setOpenIdx] = useState(0);
  const [showCommit, setShowCommit] = useState(false);
  const [committedBanner, setCommittedBanner] = useState<{ count: number; total: number } | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "focus" | "grid">("list");
  const [focusIdx, setFocusIdx] = useState(0);

  const filteredIdxs = useMemo(() => {
    if (!search.trim()) return weeks.map((_, i) => i);
    const s = search.toLowerCase();
    return weeks
      .map((w, i) => {
        const txt = (fmtRange(w.startDate) + " " + (w.note || "") + " " + (w.qbId || "") + " " + w.client).toLowerCase();
        return txt.includes(s) ? i : null;
      })
      .filter((x): x is number => x !== null);
  }, [search, weeks]);

  const committedCount = weeks.filter((w) => w.committed).length;

  const handleCommitted = (indices: number[], qbIds: (string | null)[]) => {
    markCommitted(indices, qbIds);
    const total = indices.reduce((a, i) => {
      const w = weeks[i];
      const h = w.hours.reduce((x, y) => x + (parseFloat(String(y)) || 0), 0);
      const sub = h * w.rate;
      return a + sub + (w.hstOn ? sub * (w.hstRate / 100) : 0);
    }, 0);
    setCommittedBanner({ count: indices.length, total });
  };

  return (
    <div className="app">
      <header className="topnav">
        <div className="topnav__brand">
          <span className="x">X</span>
          <span>adaptive<span style={{ color: "var(--ax-golden)" }}>X</span> Books</span>
        </div>
        <div className="topnav__crumbs">
          <span>Invoicing</span>
          <span className="sep">/</span>
          <span className="cur">Bulk weekly invoices</span>
        </div>
        <div className="topnav__right">
          <span className="qb-pill"><span className="dot" /> QuickBooks connected{companyName ? ` · ${companyName}` : ""}</span>
          <button className="user-chip" onClick={() => setUserMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={userMenuOpen} style={{ cursor: "pointer" }}>
            <span className="avatar">QB</span>
            <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{companyName || "Account"}</span>
            <ChevronDown size={14} className="user-chip__caret" />
          </button>
          {userMenuOpen && (
            <div className="usermenu" role="menu">
              <div className="usermenu__header">
                <div className="usermenu__name">Connected to QuickBooks</div>
                <div className="usermenu__email">{companyName || "Your Company"}</div>
              </div>
              <button className="usermenu__item" role="menuitem"><Eye size={14} /> View profile</button>
              <button className="usermenu__item" role="menuitem"><Lock size={14} /> Security & sessions</button>
              <button className="usermenu__item" role="menuitem"><Sparkle size={14} /> QuickBooks connection</button>
              <div className="usermenu__sep" />
              <button className="usermenu__item usermenu__item--danger" role="menuitem" onClick={onSignOut}>
                <ArrowRight size={14} /> Sign out
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
            <p className="page__sub">Set up your weekly invoice once, fill the hours grid like a timesheet, then commit the whole run to QuickBooks.</p>
          </div>
          <div className="page__actions">
            <button className="btn btn--ghost"><Calendar size={16} /> Apr 26 – Jun 6, 2026</button>
          </div>
        </div>

        {committedBanner && (
          <div className="committed-banner">
            <span className="committed-banner__icon"><Check size={20} /></span>
            <div>
              <div className="committed-banner__title">{committedBanner.count} invoices sent to QuickBooks &middot; {money(committedBanner.total)}</div>
              <div className="committed-banner__sub">They appear in QBO as drafts so you can review before sending to the client.</div>
            </div>
            <button className="committed-banner__close" onClick={() => setCommittedBanner(null)}><X size={18} /></button>
          </div>
        )}

        <div className="stats">
          <div className="stat">
            <div className="stat__label">Weeks</div>
            <div className="stat__value">{weeks.length}</div>
            <div className="stat__sub">{weeks.filter((w) => !w.skipped && !w.committed).length} drafts &middot; {committedCount} committed</div>
          </div>
          <div className="stat">
            <div className="stat__label">Total hours</div>
            <div className="stat__value">{weeks.reduce((a, w) => a + (w.skipped ? 0 : w.hours.reduce((x, y) => x + (parseFloat(String(y)) || 0), 0)), 0).toFixed(1)}</div>
            <div className="stat__sub">across active weeks</div>
          </div>
          <div className="stat">
            <div className="stat__label">Subtotal</div>
            <div className="stat__value">{money(weeks.reduce((a, w) => a + (w.skipped ? 0 : w.hours.reduce((x, y) => x + (parseFloat(String(y)) || 0), 0) * w.rate), 0))}</div>
            <div className="stat__sub">before HST</div>
          </div>
          <div className="stat stat--yellow">
            <div className="stat__label">Total billable</div>
            <div className="stat__value">{money(weeks.reduce((a, w) => {
              if (w.skipped) return a;
              const h = w.hours.reduce((x, y) => x + (parseFloat(String(y)) || 0), 0);
              const sub = h * w.rate;
              return a + sub + (w.hstOn ? sub * (w.hstRate / 100) : 0);
            }, 0))}</div>
            <div className="stat__sub">incl. HST</div>
          </div>
        </div>

        <div className="layout">
          <TemplatePanel tpl={tpl} setTpl={setTpl} weekCount={weekCount} setWeekCount={setWeekCount} startDate={startDate} setStartDate={setStartDate} />

          <div>
            <div className="toolbar">
              <div className="toolbar__left">
                <div className="searchbox">
                  <Search size={16} />
                  <input type="text" placeholder='Search weeks, notes, INV#...' value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button className="btn btn--ghost btn--sm" onClick={applyToAllFromFirst}>
                  <Copy size={14} /> Copy week 1 to all
                </button>
              </div>
              <div className="toolbar__right">
                <span className="muted" style={{ fontSize: 12 }}>* Statutory holiday</span>
                <div className="seg" role="tablist">
                  <button className={view === "focus" ? "active" : ""} onClick={() => setView("focus")}>One week</button>
                  <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>All weeks</button>
                  <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}>Compare</button>
                </div>
              </div>
            </div>

            {view === "list" && (
              <div className="weeks">
                {filteredIdxs.map((i) => (
                  <WeekRow key={i} week={weeks[i]} isOpen={openIdx === i}
                    onToggleOpen={() => setOpenIdx(openIdx === i ? -1 : i)}
                    onChange={(next) => updateWeek(i, next)}
                    onDuplicateDown={() => duplicateDown(i)}
                    onSkipToggle={() => skipToggle(i)}
                    onClearWeek={() => clearWeek(i)} />
                ))}
                {filteredIdxs.length === 0 && (
                  <div style={{ padding: 48, textAlign: "center", background: "white", border: "1px dashed var(--ax-border)", borderRadius: 12 }}>
                    <div className="muted">No weeks match "{search}"</div>
                  </div>
                )}
              </div>
            )}
            {view === "focus" && (
              <FocusView weeks={weeks} idx={Math.min(focusIdx, weeks.length - 1)} setIdx={setFocusIdx}
                onChange={updateWeek} onDuplicateDown={duplicateDown} onSkipToggle={skipToggle} onClearWeek={clearWeek} />
            )}
            {view === "grid" && <CompareView weeks={weeks} onChange={updateWeek} />}
          </div>
        </div>
      </main>

      <CommitModal open={showCommit} weeks={weeks} tpl={tpl} onClose={() => setShowCommit(false)} onCommitted={handleCommitted} />

      {/* Floating commit button */}
      {readyWeeks.length > 0 && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          display: "flex", alignItems: "center", gap: 14,
          background: "white", border: "1px solid var(--ax-border)",
          borderRadius: "var(--ax-radius-pill)", boxShadow: "var(--ax-shadow-lg)",
          padding: "8px 8px 8px 22px",
        }}>
          <div style={{ fontSize: 13, color: "var(--ax-fg-2)" }}>
            <strong style={{ color: "var(--ax-fg-1)" }}>{readyWeeks.length}</strong> ready &middot;{" "}
            <strong style={{ color: "var(--ax-fg-1)", fontFamily: "var(--ax-font-display)" }}>
              {money(readyWeeks.reduce((a, { week }) => {
                const h = week.hours.reduce((x, y) => x + (parseFloat(String(y)) || 0), 0);
                const sub = h * week.rate;
                return a + sub + (week.hstOn ? sub * (week.hstRate / 100) : 0);
              }, 0))}
            </strong>
          </div>
          <button className="btn btn--yellow" onClick={() => setShowCommit(true)}>
            <Sparkle size={16} /> Commit to QuickBooks <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
