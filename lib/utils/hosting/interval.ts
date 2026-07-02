/**
 * Format a hosting's payment interval for display. Returns '' for a one-time
 * payment (a sale) — a one-off price has no recurring interval, so rendering
 * "₦20,000,000 / One Time Payment" is nonsense. Callers should only render the
 * interval (and its leading "/" or "per") when this returns a non-empty string.
 */
export const formatPaymentInterval = (interval?: string | null): string => {
  if (!interval) return '';
  const normalized = String(interval).toUpperCase().replace(/[_\s]/g, '');
  if (normalized === 'ONETIMEPAYMENT') return '';
  return String(interval)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
