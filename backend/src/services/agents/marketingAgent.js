const BaseAgent = require('./baseAgent');
const { executeMarketingWorkflow } = require('../../config/lamaticClient');
const { selectPrompt } = require('./utils/selectPrompt');

const LABEL_KEYS = ['label', 'name', 'range', 'segment', 'group', 'category', 'region', 'persona'];
const VALUE_KEYS = ['value', 'percentage', 'percent', 'share', 'score', 'count', 'ratio'];
const NESTED_KEYS = ['distribution', 'breakdown', 'segments', 'values', 'percentages', 'data', 'items', 'entries'];

const normalizeLabel = (input) => {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ')
    .trim();
};

const pickString = (...candidates) => {
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
};

const numericValue = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const match = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    if (match) {
      return parseFloat(match[0]);
    }
  }
  return null;
};

const parseSegmentFromString = (input) => {
  if (typeof input !== 'string') return null;
  const match = input.trim().match(/^(.*?)(?:[:\-–]\s*|\s*\()\s*(\d+(?:\.\d+)?)\s*%?\)?$/i);
  if (!match) {
    const percentMatch = input.trim().match(/(\d+(?:\.\d+)?)\s*%/);
    if (!percentMatch) return null;
    const label = input.replace(percentMatch[0], '').replace(/[:\-–]/, '').trim();
    return label
      ? {
          label: normalizeLabel(label),
          value: parseFloat(percentMatch[1]),
          formattedValue: `${parseFloat(percentMatch[1])}%`,
        }
      : null;
  }
  return {
    label: normalizeLabel(match[1]),
    value: parseFloat(match[2]),
    formattedValue: `${match[2]}%`,
  };
};

const parseSegmentFromObject = (obj, fallbackLabel) => {
  if (!obj || typeof obj !== 'object') return null;
  const label = pickString(...LABEL_KEYS.map((key) => obj[key]), fallbackLabel);
  if (!label) return null;
  const valueSource = VALUE_KEYS.map((key) => obj[key]).find((val) => val !== undefined);
  if (valueSource === undefined) return null;
  const value = numericValue(valueSource);
  if (value === null) return null;
  return {
    label: normalizeLabel(label),
    value,
    formattedValue: typeof valueSource === 'string' ? valueSource.trim() : undefined,
  };
};

const parseSegmentFromLabelValue = (label, rawValue) => {
  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    return parseSegmentFromObject(rawValue, label);
  }
  if (rawValue === undefined || rawValue === null) return null;
  const value = numericValue(rawValue);
  if (value === null) return null;
  return {
    label: normalizeLabel(label),
    value,
    formattedValue: typeof rawValue === 'string' ? rawValue.trim() : undefined,
  };
};

const flattenSegments = (items) => {
  const acc = [];
  items.forEach((item) => {
    if (!item) return;
    if (Array.isArray(item)) {
      acc.push(...flattenSegments(item));
    } else if (item.label && typeof item.value === 'number' && Number.isFinite(item.value)) {
      acc.push(item);
    }
  });
  return acc;
};

const parseSegments = (source) => {
  if (!source) return [];

  if (Array.isArray(source)) {
    return flattenSegments(
      source.map((entry) => {
        if (!entry) return null;
        if (typeof entry === 'string') return parseSegmentFromString(entry);
        if (typeof entry === 'number') return null;
        if (typeof entry === 'object') return parseSegmentFromObject(entry);
        return null;
      })
    );
  }

  if (typeof source === 'object') {
    const nested = [];
    NESTED_KEYS.forEach((key) => {
      if (source[key]) {
        nested.push(parseSegments(source[key]));
      }
    });
    const direct = Object.entries(source).map(([label, value]) => parseSegmentFromLabelValue(label, value));
    return flattenSegments([...nested, ...direct]);
  }

  if (typeof source === 'string') {
    return flattenSegments(
      source
        .split(/[\n,;]/)
        .map((chunk) => parseSegmentFromString(chunk))
    );
  }

  return [];
};

const dedupeSegments = (segments) => {
  const map = new Map();
  segments.forEach((segment) => {
    if (!segment || !segment.label) return;
    const key = segment.label.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.value += segment.value;
    } else {
      map.set(key, { ...segment });
    }
  });
  return Array.from(map.values()).filter((segment) => Number.isFinite(segment.value));
};

const normalizeSegments = (segments) =>
  dedupeSegments(segments)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

const extractDemographicProfile = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return {};
  if (parsed.demographic_profile && typeof parsed.demographic_profile === 'object') return parsed.demographic_profile;
  if (parsed.demographicProfile && typeof parsed.demographicProfile === 'object') return parsed.demographicProfile;
  if (parsed.demographics && typeof parsed.demographics === 'object') return parsed.demographics;
  if (parsed.output && typeof parsed.output === 'object') return extractDemographicProfile(parsed.output);
  if (parsed.Output && typeof parsed.Output === 'object') return extractDemographicProfile(parsed.Output);
  return {};
};

const extractSegments = (...sources) => {
  for (const source of sources) {
    const segments = normalizeSegments(parseSegments(source));
    if (segments.length) {
      return segments;
    }
  }
  return [];
};

const buildDemographicInsights = (parsed) => {
  const profile = extractDemographicProfile(parsed);
  const summary = pickString(
    parsed?.target_market,
    parsed?.targetMarket,
    parsed?.narrative,
    parsed?.summary,
    profile?.summary
  );
  const persona = pickString(
    profile?.persona,
    profile?.primary_persona,
    parsed?.primary_persona,
    parsed?.persona
  );

  const charts = {};
  const ageSegments = extractSegments(profile?.age);
  if (ageSegments.length) {
    charts.age = {
      title: 'Age Distribution',
      type: 'pie',
      metric: 'percentage',
      segments: ageSegments,
    };
  }
  const genderSegments = extractSegments(profile?.gender);
  if (genderSegments.length) {
    charts.gender = {
      title: 'Gender Mix',
      type: 'pie',
      metric: 'percentage',
      segments: genderSegments,
    };
  }
  const regionSegments = extractSegments(
    profile?.regions,
    profile?.locations,
    profile?.geography,
    profile?.urbanicity,
    parsed?.regional_focus,
    parsed?.geography
  );
  if (regionSegments.length) {
    charts.region = {
      title: 'Regional Focus',
      type: 'bar',
      metric: 'percentage',
      segments: regionSegments,
    };
  }

  return {
    profile,
    charts,
    summary,
    persona,
  };
};

class MarketingAgent extends BaseAgent {
  constructor() {
    super('marketing');
  }

  async execute(jobContext) {
    const prompt = selectPrompt(jobContext, jobContext.marketingPrompt);
    const safePrompt = prompt || 'No prompt provided';

    try {
      const lamatic = await executeMarketingWorkflow(safePrompt);
      const demographicInsights = buildDemographicInsights(lamatic.parsed || lamatic.raw || {});
      return {
        raw: lamatic.raw,
        lamaticStatus: lamatic.status,
        promptUsed: safePrompt,
        structured: lamatic.parsed,
        demographicSummary: demographicInsights.summary,
        demographicPersona: demographicInsights.persona,
        demographicProfile: demographicInsights.profile,
        demographicCharts: demographicInsights.charts,
        targetMarket: demographicInsights.summary,
      };
    } catch (e) {
      return {
        raw: null,
        lamaticStatus: 'error',
        promptUsed: safePrompt,
        error: `Lamatic marketing workflow failed: ${e.message}`,
      };
    }
  }
}

module.exports = { marketingAgent: new MarketingAgent() };
