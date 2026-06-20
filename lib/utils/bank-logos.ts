type BankLogoInput = {
  imageUrl?: string | null;
  logoPath?: string | null;
  slug?: string | null;
};

const PAYSTACK_RAW_PREFIX = 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/';
const PAYSTACK_CDN_PREFIX = 'https://cdn.jsdelivr.net/gh/PaystackHQ/nigerialogos@master/';
const SUPERMX_RAW_PREFIX = 'https://raw.githubusercontent.com/supermx1/nigerian-banks-api/main/';
const SUPERMX_CDN_PREFIX = 'https://cdn.jsdelivr.net/gh/supermx1/nigerian-banks-api@main/';

export function getBankLogoUrl({ imageUrl, logoPath, slug }: BankLogoInput) {
  const normalizedImageUrl = normalizeBankLogoUrl(imageUrl);

  if (normalizedImageUrl) return normalizedImageUrl;

  const normalizedLogoPath = logoPath?.trim().replace(/^\/+/, '');

  if (normalizedLogoPath) return `${SUPERMX_CDN_PREFIX}${normalizedLogoPath}`;

  const normalizedSlug = normalizeBankSlug(slug);

  if (!normalizedSlug) return null;

  return `${SUPERMX_CDN_PREFIX}logos/${normalizedSlug}.png`;
}

function normalizeBankSlug(slug?: string | null) {
  return slug?.toLowerCase().trim().replace(/_/g, '-') || null;
}

function normalizeBankLogoUrl(imageUrl?: string | null) {
  if (!imageUrl) return null;

  const trimmedUrl = imageUrl.trim();

  if (!trimmedUrl) return null;

  if (trimmedUrl.startsWith(PAYSTACK_RAW_PREFIX)) {
    return trimmedUrl
      .replace(`${PAYSTACK_RAW_PREFIX}logos/`, `${PAYSTACK_CDN_PREFIX}public/logos/`)
      .replace(`${PAYSTACK_RAW_PREFIX}public/logos/`, `${PAYSTACK_CDN_PREFIX}public/logos/`);
  }

  return trimmedUrl.replace(SUPERMX_RAW_PREFIX, SUPERMX_CDN_PREFIX);
}
