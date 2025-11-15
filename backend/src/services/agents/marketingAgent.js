const BaseAgent = require('./baseAgent');
const { normalizeList } = require('../../utils/text');

class MarketingAgent extends BaseAgent {
  constructor() {
    super('marketing');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const specificPrompt = jobContext.specificPrompt;
    const industry = brief.industry || 'emerging market';
    const audience = normalizeList(brief.targetAudience || brief.personas);
    const problem = brief.problemStatement || 'an unmet customer problem';
    const features = normalizeList(brief.keyFeatures);

    // Enhanced analysis based on validation
    const targetMarket = brief.targetMarket || 'Global';
    const launchScope = brief.launchScope || 'Regional launch';

    const demographics = audience.length
      ? audience.map((segment) => ({ segment, painPoint: problem }))
      : [
          {
            segment: 'Early adopters within target industry',
            painPoint: problem,
          },
        ];

    // Tailor acquisition channels based on launch scope
    let acquisitionChannels;
    if (launchScope.includes('Global')) {
      acquisitionChannels = [
        'Global digital marketing campaigns',
        'International partnership marketing',
        'Multi-language content strategy',
        'Global influencer partnerships',
      ];
    } else if (launchScope.includes('Local')) {
      acquisitionChannels = [
        'Local community engagement',
        'Regional partnerships',
        'Location-based advertising',
        'Local media outreach',
      ];
    } else {
      acquisitionChannels = [
        'Thought leadership content',
        'Partnership marketing',
        'Paid social campaigns',
        'Founder-led outreach',
      ];
    }

    const enhancedNarrative = specificPrompt 
      ? `Enhanced positioning for ${targetMarket}: Position the product for ${industry} decision makers in ${targetMarket} by emphasizing how it addresses ${problem}. Launch strategy focuses on ${launchScope}.`
      : `Position the product for ${industry} decision makers by emphasizing how it addresses ${problem}.`;

    return {
      narrative: enhancedNarrative,
      demographics,
      acquisitionChannels,
      differentiators: features.slice(0, 5),
      targetMarket,
      launchScope,
      specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
    };
  }
}

module.exports = { marketingAgent: new MarketingAgent() };
