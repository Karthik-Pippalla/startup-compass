const OpenAI = require('openai');
const config = require('../../config/env');

const MODEL = process.env.OPENAI_TIMELINE_MODEL || process.env.OPENAI_HUMANIZER_MODEL || 'gpt-4o-mini';
const MAX_AGENT_SNIPPET = parseInt(process.env.AGENT_TIMELINE_MAX_INPUT || '4000', 10);

const openaiClient = config.openAiApiKey ? new OpenAI({ apiKey: config.openAiApiKey }) : null;

const SYSTEM_PROMPT = `You are an execution strategist. Read insights from marketing, developer, and funding agents plus a validated startup brief.
Return ONLY valid JSON using this shape:
{
  "phases": [
    { "phase": "string", "tasks": ["string", "..."], "durationWeeks": number }
  ],
  "notes": {
    "dependencies": ["string", "..."],
    "risks": ["string", "..."],
    "summary": "string"
  }
}
Each task must be short (max 12 words) and actionable. Create 3-5 phases ordered sequentially. Duration should be an integer between 1-6 weeks (omit durationWeeks if unknown). Use agent evidence when suggesting actions; if data is missing mention it inside notes.summary.`;

const DEFAULT_PLAN = {
  phases: [
    {
      phase: 'Discovery',
      tasks: ['Confirm problem statement', 'Validate personas', 'Align on success metrics'],
      durationWeeks: 1,
    },
    {
      phase: 'Build',
      tasks: ['Implement core features', 'Integrate data sources', 'QA + UAT'],
      durationWeeks: 4,
    },
    {
      phase: 'Launch',
      tasks: ['Deploy production stack', 'Launch marketing campaigns'],
      durationWeeks: 2,
    },
  ],
  notes: {
    summary: 'Default template used. Provide richer data to receive a customized plan.',
  },
};

const PLAN_AGENTS = ['marketing', 'developer', 'funding'];

const truncate = (text) => {
  if (!text) return '';
  return text.length > MAX_AGENT_SNIPPET ? `${text.slice(0, MAX_AGENT_SNIPPET)}… [truncated]` : text;
};

const toText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const summarizeAgentOutput = (output) => {
  if (!output) {
    return 'No data available.';
  }

  const { payload = {}, status } = output;
  const humanized = payload?.humanized;
  const lines = [];

  if (humanized?.summary) {
    lines.push(`Summary: ${humanized.summary}`);
  }
  if (humanized?.highlights?.length) {
    lines.push(`Highlights: ${humanized.highlights.join('; ')}`);
  }
  if (humanized?.recommendations?.length) {
    lines.push(`Recommendations: ${humanized.recommendations.join('; ')}`);
  }
  if (humanized?.nextSteps?.length) {
    lines.push(`Next steps: ${humanized.nextSteps.join('; ')}`);
  }

  if (!lines.length && payload?.raw) {
    lines.push(`Raw: ${truncate(toText(payload.raw))}`);
  }

  if (!lines.length) {
    lines.push(`Status: ${status}`);
  }

  return lines.join('\n');
};

const formatBrief = (validatedBrief, originalPrompt) => {
  if (validatedBrief && Object.keys(validatedBrief).length) {
    return truncate(toText(validatedBrief));
  }
  if (originalPrompt?.summary) {
    return originalPrompt.summary;
  }
  return 'No validated brief available.';
};

const normalizePlan = (rawPlan, fallbackReason) => {
  if (!rawPlan || typeof rawPlan !== 'object') {
    return {
      ...DEFAULT_PLAN,
      notes: {
        ...DEFAULT_PLAN.notes,
        reason: fallbackReason || 'Plan missing from LLM response',
      },
    };
  }

  const phases = Array.isArray(rawPlan.phases)
    ? rawPlan.phases
        .map((phase) => {
          if (!phase || typeof phase !== 'object') return null;
          const name = typeof phase.phase === 'string' ? phase.phase.trim() : null;
          if (!name) return null;
          const tasks = Array.isArray(phase.tasks)
            ? phase.tasks.map((task) => (typeof task === 'string' ? task.trim() : null)).filter(Boolean)
            : [];
          const duration =
            typeof phase.durationWeeks === 'number' && Number.isFinite(phase.durationWeeks)
              ? Math.max(1, Math.min(12, Math.round(phase.durationWeeks)))
              : undefined;
          return {
            phase: name,
            tasks: tasks.length ? tasks : ['Define tasks based on agent insights'],
            ...(duration ? { durationWeeks: duration } : {}),
          };
        })
        .filter(Boolean)
    : [];

  const notes =
    rawPlan.notes && typeof rawPlan.notes === 'object'
      ? rawPlan.notes
      : { summary: fallbackReason || 'Notes missing from model response.' };

  if (!phases.length) {
    return {
      ...DEFAULT_PLAN,
      notes: {
        ...notes,
        reason: fallbackReason || 'No valid phases returned by model.',
      },
    };
  }

  return {
    phases,
    notes,
  };
};

async function generateTimelinePlan(jobContext) {
  const agentOutputs = jobContext.agentOutputs || [];
  const insightBlocks = PLAN_AGENTS.map((name) => {
    const output = agentOutputs.find((entry) => entry.agent === name);
    return `${name.toUpperCase()}:\n${summarizeAgentOutput(output)}`;
  }).join('\n\n');

  const ideaBrief = formatBrief(jobContext.validatedBrief, jobContext.originalPrompt);

  if (!openaiClient) {
    return normalizePlan(null, 'Missing OPENAI_API_KEY; using default template.');
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Startup validated brief (JSON):\n${ideaBrief}`,
    },
    {
      role: 'user',
      content: `Agent insights:\n${insightBlocks}`,
    },
  ];

  try {
    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages,
    });
    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      return normalizePlan(null, 'Empty response from ChatGPT timeline generator.');
    }
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    }
    if (!parsed) {
      return normalizePlan(null, 'Failed to parse ChatGPT timeline JSON.');
    }
    return normalizePlan(parsed);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('generateTimelinePlan() failed', error.message || error);
    return normalizePlan(null, error.message || 'Timeline generation error');
  }
}

module.exports = { generateTimelinePlan, PLAN_AGENTS };
