export function money(n: number, opts: { sign?: string; decimals?: number } = {}): string {
  const { sign = "$", decimals = 2 } = opts;
  if (isNaN(n) || n == null) n = 0;
  const neg = n < 0;
  const abs = Math.abs(n);
  const str = abs.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (neg ? "-" : "") + sign + str;
}
