// Date and money helpers

const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DOW_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MON_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Build a list of week-start dates (Sunday-based) starting at startDate, count weeks
function buildWeeks(startDateStr, count) {
  const start = new Date(startDateStr + 'T00:00:00');
  // back up to Sunday
  const d0 = new Date(start);
  d0.setDate(d0.getDate() - d0.getDay());
  const weeks = [];
  for (let i = 0; i < count; i++) {
    const ws = new Date(d0); ws.setDate(d0.getDate() + i*7);
    weeks.push(ws);
  }
  return weeks;
}

function fmtDateShort(d) {
  return MON_SHORT[d.getMonth()] + ' ' + d.getDate();
}
function fmtDateLong(d) {
  return MON_LONG[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}
function fmtMD(d) {
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return m + '/' + dd;
}
function fmtRange(ws) {
  const we = new Date(ws); we.setDate(ws.getDate()+6);
  return fmtDateShort(ws) + ' – ' + fmtDateShort(we) + ', ' + we.getFullYear();
}

function money(n, opts = {}) {
  const { sign = '$', decimals = 2 } = opts;
  if (isNaN(n) || n == null) n = 0;
  const neg = n < 0;
  const abs = Math.abs(n);
  const str = abs.toLocaleString('en-CA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (neg ? '-' : '') + sign + str;
}

// Stat holiday lookup (ON-only sample). Map ISO date -> name.
const HOLIDAYS_ON = {
  '2026-01-01': "New Year's Day",
  '2026-02-16': 'Family Day',
  '2026-04-03': 'Good Friday',
  '2026-05-18': 'Victoria Day',
  '2026-07-01': 'Canada Day',
  '2026-08-03': 'Civic Holiday',
  '2026-09-07': 'Labour Day',
  '2026-10-12': 'Thanksgiving',
  '2026-12-25': 'Christmas Day',
  '2026-12-28': 'Boxing Day (obs.)',
};

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}
function isHoliday(d) { return !!HOLIDAYS_ON[isoDate(d)]; }
function holidayName(d) { return HOLIDAYS_ON[isoDate(d)] || ''; }

Object.assign(window, {
  DOW, DOW_LONG, MON_SHORT, MON_LONG,
  buildWeeks, fmtDateShort, fmtDateLong, fmtMD, fmtRange, money,
  isoDate, isHoliday, holidayName,
});
