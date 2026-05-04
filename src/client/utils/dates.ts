export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MON_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MON_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function buildWeeks(startDateStr: string, count: number): Date[] {
  const start = new Date(startDateStr + "T00:00:00");
  const d0 = new Date(start);
  d0.setDate(d0.getDate() - d0.getDay());
  const weeks: Date[] = [];
  for (let i = 0; i < count; i++) {
    const ws = new Date(d0);
    ws.setDate(d0.getDate() + i * 7);
    weeks.push(ws);
  }
  return weeks;
}

export function fmtDateShort(d: Date): string {
  return MON_SHORT[d.getMonth()] + " " + d.getDate();
}

export function fmtDateLong(d: Date): string {
  return MON_LONG[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

export function fmtMD(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return m + "/" + dd;
}

export function fmtRange(ws: Date): string {
  const we = new Date(ws);
  we.setDate(ws.getDate() + 6);
  return fmtDateShort(ws) + " – " + fmtDateShort(we) + ", " + we.getFullYear();
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// Ontario statutory holidays
const HOLIDAYS_ON: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-02-16": "Family Day",
  "2026-04-03": "Good Friday",
  "2026-05-18": "Victoria Day",
  "2026-07-01": "Canada Day",
  "2026-08-03": "Civic Holiday",
  "2026-09-07": "Labour Day",
  "2026-10-12": "Thanksgiving",
  "2026-12-25": "Christmas Day",
  "2026-12-28": "Boxing Day (obs.)",
};

export function isHoliday(d: Date): boolean {
  return !!HOLIDAYS_ON[isoDate(d)];
}

export function holidayName(d: Date): string {
  return HOLIDAYS_ON[isoDate(d)] || "";
}
