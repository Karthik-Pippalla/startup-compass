const BaseAgent = require('./baseAgent');

// Agent-specific validation requirements
const AGENT_REQUIREMENTS = {
  marketing: {
    required: ['targetMarket', 'launchScope'],
    questions: [
      {
        key: 'targetMarket',
        label: 'What is your target market or region?',
        helpText: 'Specify if you plan to launch globally or in specific regions/countries.',
        type: 'select',
        options: [
          { label: 'Global', value: 'Global' },
          { label: 'North America', value: 'North America' },
          { label: 'Europe', value: 'Europe' },
          { label: 'Asia-Pacific', value: 'Asia-Pacific' },
          { label: 'Specific Country/Region', value: 'Specific Country/Region' },
          { label: 'Local/City', value: 'Local/City' }
        ]
      },
      {
        key: 'launchScope',
        label: 'What is your initial launch scope?',
        helpText: 'Are you starting locally or going global from day one?',
        type: 'select',
        options: [
          { label: 'Global launch', value: 'Global launch' },
          { label: 'Regional launch', value: 'Regional launch' },
          { label: 'Local/City launch', value: 'Local/City launch' },
          { label: 'Specific countries', value: 'Specific countries' }
        ]
      }
    ]
  },
  funding: {
    required: [], // No specific requirements for funding agent
    questions: []
  },
  technical: {
    required: ['technologyPreference'],
    questions: [
      {
        key: 'technologyPreference',
        label: 'Do you have specific technology requirements?',
        helpText: 'Any preferred programming languages, frameworks, or technical constraints?',
        type: 'textarea'
      },
      {
        key: 'technicalExpertise',
        label: 'What is your technical expertise level?',
        helpText: 'This helps us recommend appropriate technology stacks.',
        type: 'select',
        options: [
          { label: 'Non-technical', value: 'Non-technical' },
          { label: 'Basic', value: 'Basic' },
          { label: 'Intermediate', value: 'Intermediate' },
          { label: 'Advanced', value: 'Advanced' },
          { label: 'Expert', value: 'Expert' }
        ]
      }
    ]
  },
  competitor: {
    required: ['competitorScope', 'marketAnalysisRegion'],
    questions: [
      {
        key: 'competitorScope',
        label: 'What market scope should we analyze for competitors?',
        helpText: 'Should we focus on global competitors or specific regional players?',
        type: 'select',
        options: [
          { label: 'Global competitors', value: 'Global competitors' },
          { label: 'Regional competitors', value: 'Regional competitors' },
          { label: 'Local competitors', value: 'Local competitors' },
          { label: 'All levels', value: 'All levels' }
        ]
      },
      {
        key: 'marketAnalysisRegion',
        label: 'Which regions should we focus competitor analysis on?',
        helpText: 'Same as marketing scope - specify the geographic focus for competitive analysis.',
        type: 'select',
        options: [
          { label: 'Global', value: 'Global' },
          { label: 'North America', value: 'North America' },
          { label: 'Europe', value: 'Europe' },
          { label: 'Asia-Pacific', value: 'Asia-Pacific' },
          { label: 'Specific Country/Region', value: 'Specific Country/Region' },
          { label: 'Local/City', value: 'Local/City' }
        ]
      }
    ]
  }
};

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
];

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const extractInfoFromPrompt = (prompt) => {
  const info = {};
  const lowerPrompt = prompt.toLowerCase();

  // Extract basic info from prompt using keywords
  if (lowerPrompt.includes('global') || lowerPrompt.includes('worldwide') || lowerPrompt.includes('international')) {
    info.targetMarket = 'Global';
    info.launchScope = 'Global launch';
    info.competitorScope = 'Global competitors';
    info.marketAnalysisRegion = 'Global';
  } else if (lowerPrompt.includes('local') || lowerPrompt.includes('city')) {
    info.targetMarket = 'Local/City';
    info.launchScope = 'Local/City launch';
    info.competitorScope = 'Local competitors';
    info.marketAnalysisRegion = 'Local/City';
  } else if (lowerPrompt.includes('north america') || lowerPrompt.includes('usa') || lowerPrompt.includes('united states')) {
    info.targetMarket = 'North America';
    info.launchScope = 'Regional launch';
    info.competitorScope = 'Regional competitors';
    info.marketAnalysisRegion = 'North America';
  } else if (lowerPrompt.includes('europe') || lowerPrompt.includes('european')) {
    info.targetMarket = 'Europe';
    info.launchScope = 'Regional launch';
    info.competitorScope = 'Regional competitors';
    info.marketAnalysisRegion = 'Europe';
  }

  // Extract technology preferences
  const techKeywords = ['react', 'angular', 'vue', 'node', 'python', 'java', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'native'];
  const foundTech = techKeywords.filter(tech => lowerPrompt.includes(tech));
  if (foundTech.length > 0) {
    info.technologyPreference = `Prefers: ${foundTech.join(', ')}`;
  }

  return info;
};

class ValidationAgent extends BaseAgent {
  constructor() {
    super('validation');
  }

  async execute(jobContext) {
    const answersMap = jobContext?.questionnaire?.answers || new Map();
    const answersObject = answersMap instanceof Map ? Object.fromEntries(answersMap.entries()) : answersMap;
    const originalPrompt = jobContext?.originalPrompt || '';

    // Extract info from the original prompt
    const extractedInfo = extractInfoFromPrompt(originalPrompt);
    
    // Merge existing answers with extracted info
    const completeBrief = { ...extractedInfo, ...answersObject };

    // Check basic required fields
    const missingBasicFields = REQUIRED_FIELDS.filter((field) =>
      isEmptyValue(completeBrief[field.key])
    );

    // Check agent-specific requirements
    const missingAgentFields = [];
    const agentQuestions = [];

    Object.entries(AGENT_REQUIREMENTS).forEach(([agentName, requirements]) => {
      requirements.required.forEach(fieldKey => {
        if (isEmptyValue(completeBrief[fieldKey])) {
          const question = requirements.questions.find(q => q.key === fieldKey);
          if (question) {
            missingAgentFields.push(fieldKey);
            agentQuestions.push({ ...question, agent: agentName });
          }
        }
      });
      
      // Add optional questions that are not required but helpful
      requirements.questions.forEach(question => {
        if (!requirements.required.includes(question.key) && isEmptyValue(completeBrief[question.key])) {
          agentQuestions.push({ ...question, agent: agentName, optional: true });
        }
      });
    });

    const allMissingFields = [...missingBasicFields.map(f => f.key), ...missingAgentFields];
    const allQuestions = [
      ...missingBasicFields.map(({ key, label, helpText, type, options }) => ({
        key,
        label,
        helpText,
        type,
        options,
      })),
      ...agentQuestions
    ];

    // Generate agent-specific prompts if we have enough information
    const agentPrompts = {};
    
    // Only generate prompts if basic info is available
    if (missingBasicFields.length === 0) {
      agentPrompts.marketing = this.generateMarketingPrompt(completeBrief);
      agentPrompts.funding = this.generateFundingPrompt(completeBrief);
      agentPrompts.technical = this.generateTechnicalPrompt(completeBrief);
      agentPrompts.competitor = this.generateCompetitorPrompt(completeBrief);
    }

    return {
      status: allMissingFields.length ? 'needs_info' : 'complete',
      validatedBrief: completeBrief,
      missingFields: allMissingFields,
      questions: allQuestions,
      agentPrompts: agentPrompts,
      extractedInfo: extractedInfo // For debugging
    };
  }

  generateMarketingPrompt(brief) {
    const scope = brief.launchScope || 'regional launch';
    const market = brief.targetMarket || 'target market';
    
    return `
Analyze the marketing strategy for "${brief.ideaName || 'this product'}" in the ${brief.industry || 'target industry'} industry.

Product: ${brief.productDescription || 'Product description not provided'}
Target Audience: ${brief.targetAudience || 'Target audience not specified'}
Launch Scope: ${scope}
Target Market: ${market}

Focus on:
1. Market positioning for ${market}
2. Customer acquisition strategies suitable for ${scope}
3. Regional/global considerations based on ${scope}
4. Competitive positioning in ${market}
5. Go-to-market strategy for ${scope}
`;
  }

  generateFundingPrompt(brief) {
    return `
Analyze funding opportunities for "${brief.ideaName || 'this startup'}" in the ${brief.industry || 'target industry'} industry.

Product: ${brief.productDescription || 'Product description not provided'}
Industry: ${brief.industry || 'Industry not specified'}
Problem: ${brief.problemStatement || 'Problem statement not provided'}
Key Features: ${Array.isArray(brief.keyFeatures) ? brief.keyFeatures.join(', ') : brief.keyFeatures || 'Features not specified'}

Focus on:
1. Funding stage recommendations
2. Investor matching based on industry and business model
3. Funding amount estimates
4. Investment readiness assessment
5. Alternative funding options
`;
  }

  generateTechnicalPrompt(brief) {
    const techPrefs = brief.technologyPreference || 'no specific technology requirements';
    const expertise = brief.technicalExpertise || 'not specified';
    
    return `
Analyze the technical requirements and development roadmap for "${brief.ideaName || 'this product'}".

Product: ${brief.productDescription || 'Product description not provided'}
Key Features: ${Array.isArray(brief.keyFeatures) ? brief.keyFeatures.join(', ') : brief.keyFeatures || 'Features not specified'}
Technology Preferences: ${techPrefs}
Technical Expertise Level: ${expertise}
Existing Constraints: ${brief.technicalConstraints || 'None specified'}

Focus on:
1. Recommended technology stack based on preferences and expertise level
2. Architecture recommendations
3. Development timeline and milestones
4. Technical risks and mitigation strategies
5. Scalability considerations
`;
  }

  generateCompetitorPrompt(brief) {
    const scope = brief.competitorScope || 'all levels';
    const region = brief.marketAnalysisRegion || 'global';
    
    return `
Analyze the competitive landscape for "${brief.ideaName || 'this product'}" in the ${brief.industry || 'target industry'} industry.

Product: ${brief.productDescription || 'Product description not provided'}
Problem: ${brief.problemStatement || 'Problem statement not provided'}
Key Features: ${Array.isArray(brief.keyFeatures) ? brief.keyFeatures.join(', ') : brief.keyFeatures || 'Features not specified'}
Analysis Scope: ${scope}
Geographic Focus: ${region}

Focus on:
1. ${scope} competitive analysis
2. Market leaders in ${region}
3. Direct and indirect competitors
4. Competitive advantages and differentiators
5. Market gaps and opportunities in ${region}
`;
  }
}

module.exports = {
  AGENT_REQUIREMENTS,
  REQUIRED_FIELDS,
  validationAgent: new ValidationAgent(),
};
