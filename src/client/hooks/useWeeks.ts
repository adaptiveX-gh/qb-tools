import { useState, useEffect, useMemo } from "react";
import { buildWeeks, isoDate } from "../utils/dates";

export interface Week {
  startDate: Date;
  hours: number[];
  note: string;
  payCode: string;
  skipped: boolean;
  committed: boolean;
  qbId: string | null;
  client: string;
  project: string;
  item: string;
  rate: number;
  hstOn: boolean;
  hstRate: number;
}

export interface Template {
  client: string;
  project: string;
  item: string;
  rate: number;
  hstOn: boolean;
  hstRate: number;
  hstNum: string;
}

function makeWeek(startDate: Date, tpl: Template, defaults: Partial<Week> = {}): Week {
  return {
    startDate,
    hours: defaults.hours || [0, 7.5, 7.5, 7.5, 7.5, 7.5, 0],
    note: defaults.note || "",
    payCode: defaults.payCode || "Regular Time",
    skipped: false,
    committed: false,
    qbId: null,
    client: tpl.client,
    project: tpl.project,
    item: tpl.item,
    rate: tpl.rate,
    hstOn: tpl.hstOn,
    hstRate: tpl.hstRate,
  };
}

export function useWeeks(startDate: string, weekCount: number, tpl: Template) {
  const [weeks, setWeeks] = useState<Week[]>(() => {
    const wks = buildWeeks(startDate, weekCount);
    return wks.map((ws) => makeWeek(ws, tpl));
  });

  // Rebuild weeks when start date or count changes
  useEffect(() => {
    const wks = buildWeeks(startDate, weekCount);
    setWeeks((prev) =>
      wks.map((ws) => {
        const existing = prev.find((w) => isoDate(w.startDate) === isoDate(ws));
        if (existing) return { ...existing, startDate: ws };
        return makeWeek(ws, tpl);
      })
    );
  }, [startDate, weekCount]);

  // Propagate template changes to non-committed weeks
  useEffect(() => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.committed
          ? w
          : { ...w, client: tpl.client, project: tpl.project, item: tpl.item, rate: tpl.rate, hstOn: tpl.hstOn, hstRate: tpl.hstRate }
      )
    );
  }, [tpl]);

  const updateWeek = (idx: number, next: Week) => {
    setWeeks((ws) => ws.map((w, i) => (i === idx ? next : w)));
  };

  const duplicateDown = (idx: number) => {
    setWeeks((ws) =>
      ws.map((w, i) => {
        if (i <= idx || w.committed) return w;
        return { ...w, hours: [...ws[idx].hours], payCode: ws[idx].payCode, note: ws[idx].note };
      })
    );
  };

  const skipToggle = (idx: number) => {
    setWeeks((ws) => ws.map((w, i) => (i === idx ? { ...w, skipped: !w.skipped } : w)));
  };

  const clearWeek = (idx: number) => {
    setWeeks((ws) => ws.map((w, i) => (i === idx ? { ...w, hours: [0, 0, 0, 0, 0, 0, 0], note: "" } : w)));
  };

  const applyToAllFromFirst = () => {
    setWeeks((ws) => {
      const first = ws[0];
      return ws.map((w, i) => (i === 0 || w.committed ? w : { ...w, hours: [...first.hours], payCode: first.payCode }));
    });
  };

  const markCommitted = (indices: number[], qbIds: (string | null)[]) => {
    setWeeks((ws) =>
      ws.map((w, i) => {
        const pos = indices.indexOf(i);
        if (pos === -1) return w;
        return { ...w, committed: true, qbId: qbIds[pos] };
      })
    );
  };

  const readyWeeks = useMemo(() => {
    return weeks
      .map((w, i) => ({ week: w, index: i }))
      .filter(({ week }) => {
        if (week.skipped || week.committed) return false;
        const h = week.hours.reduce((a, b) => a + (parseFloat(String(b)) || 0), 0);
        return h > 0;
      });
  }, [weeks]);

  return {
    weeks,
    setWeeks,
    updateWeek,
    duplicateDown,
    skipToggle,
    clearWeek,
    applyToAllFromFirst,
    markCommitted,
    readyWeeks,
  };
}
