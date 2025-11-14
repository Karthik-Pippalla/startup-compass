const BaseAgent = require('./baseAgent');
const { normalizeList } = require('../../utils/text');

class MarketingAgent extends BaseAgent {
  constructor() {
    super('marketing');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const industry = brief.industry || 'emerging market';
    const audience = normalizeList(brief.targetAudience || brief.personas);
    const problem = brief.problemStatement || 'an unmet customer problem';
    const features = normalizeList(brief.keyFeatures);

    const demographics = audience.length
      ? audience.map((segment) => ({ segment, painPoint: problem }))
      : [
          {
            segment: 'Early adopters within target industry',
            painPoint: problem,
          },
        ];

    const acquisitionChannels = [
      'Thought leadership content',
      'Partnership marketing',
      'Paid social campaigns',
      'Founder-led outreach',
    ];

    return {
      narrative: `Position the product for ${industry} decision makers by emphasizing how it addresses ${problem}.`,
      demographics,
      acquisitionChannels,
      differentiators: features.slice(0, 5),
    };
  }
}

module.exports = { marketingAgent: new MarketingAgent() };
