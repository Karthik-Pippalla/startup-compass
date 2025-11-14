const defaultKeywords = ['ai', 'vr', 'fintech', 'saas', 'health', 'education'];

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim());
  }
  return String(value)
    .split(/,|\n/) // eslint-disable-line no-useless-escape
    .map((chunk) => chunk.trim())
    .filter(Boolean);
};

const extractKeywords = (text = '') => {
  const normalized = String(text).toLowerCase();
  const tokens = normalized
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const unique = Array.from(new Set(tokens));
  return unique.length ? unique : defaultKeywords;
};

module.exports = { normalizeList, extractKeywords };
