const BaseAgent = require('./baseAgent');
const { normalizeList } = require('../../utils/text');
const { executeMarketingWorkflow } = require('../../config/lamaticClient');

class MarketingAgent extends BaseAgent {
  constructor() {
    super('marketing');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const specificPrompt = jobContext.specificPrompt;

    // If a direct marketing prompt is provided, use that, else construct from brief
    const directPrompt = jobContext.marketingPrompt;
    const constructedPrompt = [
      `Industry: ${brief.industry || 'emerging market'}`,
      `Product: ${brief.productDescription || 'innovative solution'}`,
      `Problem: ${brief.problemStatement || 'an unmet customer problem'}`,
      `Features: ${Array.isArray(brief.keyFeatures) ? brief.keyFeatures.join(', ') : (brief.keyFeatures || '')}`,
      `Target Market: ${brief.targetMarket || 'Global'}`,
      `Launch Scope: ${brief.launchScope || 'Regional launch'}`,
    ].filter(Boolean).join(' | ');
    const prompt = directPrompt || constructedPrompt;

    let lamatic;
    try {
      lamatic = await executeMarketingWorkflow(prompt);
    } catch (e) {
      // Fall back to legacy local logic if Lamatic fails
      const industry = brief.industry || 'emerging market';
      const audience = normalizeList(brief.targetAudience || brief.personas);
      const problem = brief.problemStatement || 'an unmet customer problem';
      const features = normalizeList(brief.keyFeatures);
      const targetMarket = brief.targetMarket || 'Global';
      const launchScope = brief.launchScope || 'Regional launch';
      const demographics = audience.length ? audience.map(segment => ({ segment, painPoint: problem })) : [{ segment: 'Early adopters', painPoint: problem }];
      return {
        error: `Lamatic marketing workflow failed: ${e.message}`,
        narrative: `Position the product for ${industry} decision makers emphasizing ${problem}.`,
        demographics,
        acquisitionChannels: ['Content marketing', 'Partnerships', 'Social ads'],
        differentiators: features.slice(0,5),
        targetMarket,
        launchScope,
        lamaticStatus: 'error',
        raw: null,
        specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
      };
    }

    const parsed = lamatic.parsed || {};
    // Support both direct structured object or wrapped under Output
    const output = parsed.Output || parsed;

    const demographicProfile = output.demographic_profile || {};
    const behavioralProfile = output.behavioral_profile || {};
    const psychographicProfile = output.psychographic_profile || {};

    // Flatten for convenience
    const demographics = demographicProfile.age || demographicProfile.gender || demographicProfile.education_level ? demographicProfile : {};

    return {
      lamaticStatus: lamatic.status,
      raw: lamatic.raw,
      promptUsed: prompt,
      demographicProfile,
      behavioralProfile,
      psychographicProfile,
      demographics, // shorthand
      narrative: `AI-assisted market synthesis for: ${brief.productDescription || 'product'} focusing on core matchmaking value proposition`,
      targetMarket: brief.targetMarket || 'Global',
      launchScope: brief.launchScope || 'Regional launch',
      specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
    };
  }
}

module.exports = { marketingAgent: new MarketingAgent() };
