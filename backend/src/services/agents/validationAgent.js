const BaseAgent = require('./baseAgent');

/**
 * The previous validation flow enforced a long questionnaire before any downstream
 * agent could begin running. The new experience simply forwards the exact prompt
 * the user provided to every downstream agent with no additional preprocessing.
 */
const answersToObject = (answersMap) => {
  if (!answersMap) return {};
  if (answersMap instanceof Map) {
    return Object.fromEntries(answersMap.entries());
  }
  if (typeof answersMap === 'object') {
    return { ...answersMap };
  }
  return {};
};

const extractOriginalPrompt = (jobContext = {}) => {
  const raw = jobContext.originalPrompt;
  if (typeof raw === 'string') {
    return raw.trim();
  }
  if (raw && typeof raw === 'object') {
    const summary = typeof raw.summary === 'string' ? raw.summary.trim() : '';
    if (summary) return summary;
    const prompt = typeof raw.prompt === 'string' ? raw.prompt.trim() : '';
    if (prompt) return prompt;
  }
  return '';
};

class ValidationAgent extends BaseAgent {
  constructor() {
    super('validation');
  }

  async execute(jobContext = {}) {
    const answersObject = answersToObject(jobContext?.questionnaire?.answers);
    const originalPrompt = extractOriginalPrompt(jobContext);

    const agentPrompts = {};
    if (originalPrompt) {
      ['marketing', 'developer', 'funding', 'competitor'].forEach((agent) => {
        agentPrompts[agent] = originalPrompt;
      });
      agentPrompts.technical = originalPrompt; // maintain backward compatibility
    }

    return {
      status: 'complete',
      validatedBrief: answersObject,
      missingFields: [],
      questions: [],
      agentPrompts,
      extractedInfo: { forwardedPrompt: originalPrompt },
    };
  }
}

module.exports = {
  validationAgent: new ValidationAgent(),
};
