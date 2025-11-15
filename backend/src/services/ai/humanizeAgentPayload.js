const OpenAI = require('openai');
const config = require('../../config/env');

const MODEL = process.env.OPENAI_HUMANIZER_MODEL || 'gpt-4o-mini';
const MAX_INPUT_CHARS = parseInt(process.env.AGENT_HUMANIZER_MAX_INPUT || '6000', 10);

const openaiClient = config.openAiApiKey ? new OpenAI({ apiKey: config.openAiApiKey }) : null;

const systemPrompt = `You are a senior startup strategist. Convert structured but messy agent output into something a founder can skim quickly.
Always respond with a JSON object that contains:
{
  "summary": "2 sentence overview",
  "highlights": ["key point", "..."],
  "recommendations": ["action item", "..."],
  "nextSteps": ["optional future work items"]
}
Do not include Markdown characters like "-" or "*" inside the arrays, just plain sentences.`;

const toSerializableString = (payload) => {
  if (payload === null || payload === undefined) return '';
  if (typeof payload === 'string') return payload;
  try {
    return JSON.stringify(payload, null, 2);
  } catch (err) {
    return String(payload);
  }
};

const truncate = (text) => {
  if (!text) return '';
  return text.length > MAX_INPUT_CHARS ? `${text.slice(0, MAX_INPUT_CHARS)}\n\n[truncated]` : text;
};

const parseMessageContent = (content) => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part) return '';
        if (typeof part === 'string') return part;
        if (typeof part.text === 'string') return part.text;
        return JSON.stringify(part);
      })
      .join('\n');
  }
  if (typeof content === 'object' && 'text' in content && typeof content.text === 'string') {
    return content.text;
  }
  return String(content);
};

const normalizeHumanized = (rawText) => {
  if (!rawText) return null;
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      return {
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      };
    }
  } catch {
    // fall back to treating the raw text as the summary
  }

  return {
    summary: trimmed,
    highlights: [],
    recommendations: [],
    nextSteps: [],
  };
};

async function humanizeAgentPayload(agentName, payload) {
  if (!openaiClient) return null;

  const serializedPayload = truncate(toSerializableString(payload));
  if (!serializedPayload) return null;

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Agent Name: ${agentName}\n\nRaw Output:\n${serializedPayload}`,
    },
  ];

  try {
    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages,
    });

    const content = parseMessageContent(completion?.choices?.[0]?.message?.content);
    const normalized = normalizeHumanized(content);
    if (!normalized) return null;

    return {
      ...normalized,
      model: completion?.model || MODEL,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    const error = new Error(`Failed to humanize ${agentName} output: ${err.message || err}`);
    error.cause = err;
    throw error;
  }
}

module.exports = { humanizeAgentPayload };
