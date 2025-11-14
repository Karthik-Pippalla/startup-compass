const BaseAgent = require('./baseAgent');

const REQUIRED_FIELDS = [
  {
    key: 'ideaName',
    label: 'What is the name of your product or initiative?',
    helpText: 'Short memorable name or working title.',
    type: 'text',
  },
  {
    key: 'productDescription',
    label: 'Describe the solution in 2-3 sentences.',
    helpText: 'Focus on user value rather than implementation details.',
    type: 'textarea',
  },
  {
    key: 'industry',
    label: 'Which industry or market are you targeting?',
    type: 'text',
  },
  {
    key: 'targetAudience',
    label: 'Who is the primary target audience?',
    type: 'textarea',
  },
  {
    key: 'problemStatement',
    label: 'What problem or unmet need are you solving?',
    type: 'textarea',
  },
  {
    key: 'keyFeatures',
    label: 'List the must-have features for the MVP.',
    type: 'tags',
  },
  {
    key: 'budgetRange',
    label: 'What is the approximate budget range?',
    helpText: 'Example: $50k - $100k or “bootstrapped only”.',
    type: 'text',
  },
  {
    key: 'timeline',
    label: 'What is the target launch timeline?',
    type: 'text',
  },
  {
    key: 'technicalConstraints',
    label: 'Any technical constraints or existing stack requirements?',
    type: 'textarea',
  },
  {
    key: 'successMetrics',
    label: 'How will you measure success?',
    type: 'textarea',
  },
];

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

class ValidationAgent extends BaseAgent {
  constructor() {
    super('validation');
  }

  async execute(jobContext) {
    const answersMap = jobContext?.questionnaire?.answers || new Map();
    const answersObject =
      answersMap instanceof Map
        ? Object.fromEntries(answersMap.entries())
        : answersMap;

    const existingBrief = jobContext.validatedBrief || {};
    const completeBrief = { ...existingBrief, ...answersObject };

    const missingFields = REQUIRED_FIELDS.filter((field) =>
      isEmptyValue(completeBrief[field.key]),
    );

    return {
      status: missingFields.length ? 'needs_info' : 'complete',
      validatedBrief: completeBrief,
      missingFields: missingFields.map((field) => field.key),
      questions: missingFields.map(({ key, label, helpText, type, options }) => ({
        key,
        label,
        helpText,
        type,
        options,
      })),
    };
  }
}

module.exports = {
  REQUIRED_FIELDS,
  validationAgent: new ValidationAgent(),
};
