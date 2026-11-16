/**
 * Finds links, email addresses and phone numbers in chat text, so bubbles can
 * make them tappable (WhatsApp-style). Pure and dependency-free.
 *
 * Phone numbers: Nigerian mobiles in every common shape (0803 123 4567,
 * 08031234567, +234 803 123 4567, 234-803-123-4567) and other international
 * numbers written with a leading +. Bare short digit runs (prices, years,
 * listing codes) are never treated as phones.
 */

export type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'url'; text: string; href: string }
  | { kind: 'email'; text: string; href: string }
  | { kind: 'phone'; text: string; href: string; digits: string; whatsapp: string };

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const URL_RE =
  /\b(?:https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.(?:com|ng|org|net|io|app|co|me|info|biz|store|africa)(?:\/[^\s<>"]*)?)/gi;
// Nigerian mobile: (+)234 or 0, then 7/8/9, 0/1, then 8 digits; spaces, dashes,
// dots or brackets allowed between groups. Then any other "+country" number.
const PHONE =
  /(?:\+?\(?234\)?[\s.-]?|\b0)[789][01](?:[\s.-]?\d){8}\b|\+\d{1,3}(?:[\s.-]?\(?\d+\)?){2,6}/g;

const TRAILING = /[.,!?;:'")\]}]+$/;

function trimTrailing(raw: string) {
  const m = raw.match(TRAILING);
  if (!m) return raw;
  // Keep a closing bracket that pairs with an opening one in the link itself.
  let cut = raw.slice(0, raw.length - m[0].length);
  const tail = m[0];
  if (tail.startsWith(')') && cut.includes('(')) cut += ')';
  return cut;
}

/** Digits only, with Nigerian numbers in +234 international form. */
export function normalizePhone(raw: string): { digits: string; international: string } | null {
  const plus = raw.trim().startsWith('+');
  let d = raw.replace(/\D/g, '');
  if (!d) return null;
  if (!plus && d.length === 11 && d.startsWith('0')) d = `234${d.slice(1)}`;
  if (d.length < 8 || d.length > 15) return null;
  return { digits: d, international: `+${d}` };
}

type Hit = { start: number; end: number; seg: Segment };

function collect(text: string): Hit[] {
  const hits: Hit[] = [];
  const add = (start: number, raw: string, make: (s: string) => Segment | null) => {
    const clean = trimTrailing(raw);
    if (!clean) return;
    const seg = make(clean);
    if (seg) hits.push({ start, end: start + clean.length, seg });
  };
  for (const m of text.matchAll(EMAIL)) {
    add(m.index!, m[0], (s) => ({ kind: 'email', text: s, href: `mailto:${s}` }));
  }
  for (const m of text.matchAll(URL_RE)) {
    add(m.index!, m[0], (s) => {
      // "e.g." / "i.e." / a lone TLD-looking word with no letters before the dot: skip.
      if (!/[A-Za-z]{2,}/.test(s.split('.')[0] ?? '') && !/^https?:/i.test(s)) return null;
      const href = /^https?:\/\//i.test(s) ? s : `https://${s}`;
      return { kind: 'url', text: s, href };
    });
  }
  for (const m of text.matchAll(PHONE)) {
    add(m.index!, m[0], (s) => {
      const n = normalizePhone(s);
      if (!n) return null;
      return { kind: 'phone', text: s, href: `tel:${n.international}`, digits: n.digits, whatsapp: `https://wa.me/${n.digits}` };
    });
  }
  // Earliest first; on overlap keep the earlier/longer one (an email beats the
  // domain inside it, a URL beats digits inside it).
  hits.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const out: Hit[] = [];
  for (const h of hits) {
    const prev = out[out.length - 1];
    if (prev && h.start < prev.end) continue;
    out.push(h);
  }
  return out;
}

export function linkify(text: string): Segment[] {
  if (!text) return [];
  const hits = collect(text);
  if (!hits.length) return [{ kind: 'text', text }];
  const out: Segment[] = [];
  let at = 0;
  for (const h of hits) {
    if (h.start > at) out.push({ kind: 'text', text: text.slice(at, h.start) });
    out.push(h.seg);
    at = h.end;
  }
  if (at < text.length) out.push({ kind: 'text', text: text.slice(at) });
  return out;
}

/** True when the text has anything tappable (lets plain bubbles skip the work). */
export function hasLinks(text: string) {
  return collect(text).length > 0;
}
