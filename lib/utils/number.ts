/**
 * Compact large numbers for listing surfaces (₦2,000,000,000 → "2B") so prices
 * are readable at a glance — mirrors the web-app's abbreviateNumber. Pure
 * implementation (no Intl compact notation, which Hermes doesn't support
 * reliably). Below 1,000 falls back to locale grouping.
 */
export function abbreviateNumber(num: number, maxDecimals: number = 1): string {
  if (!Number.isFinite(num)) return '0';
  const abs = Math.abs(num);
  const fmt = (value: number, suffix: string) => {
    // Trim trailing zeros: 2.0 → "2", 1.50 → "1.5".
    const s = value.toFixed(maxDecimals).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1');
    return `${s}${suffix}`;
  };
  if (abs >= 1e12) return fmt(num / 1e12, 'T');
  if (abs >= 1e9) return fmt(num / 1e9, 'B');
  if (abs >= 1e6) return fmt(num / 1e6, 'M');
  if (abs >= 1e3) return fmt(num / 1e3, 'K');
  return num.toLocaleString();
}
