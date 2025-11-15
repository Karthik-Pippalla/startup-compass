const BaseAgent = require('./baseAgent');
const { executeCompetitorWorkflow } = require('../../config/lamaticClient');

class CompetitorAgent extends BaseAgent {
  constructor() { super('competitor'); }

  getMockCompetitors(industry, features) {
    return (features || []).slice(0, 3).map((feature, i) => ({
      name: `${industry} competitor ${i + 1}`,
      differentiator: `Focuses on ${feature}`,
      pricing: 'Custom',
    }));
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const specificPrompt = jobContext.specificPrompt;
    const forwardedPrompt = typeof specificPrompt === 'string' && specificPrompt.length ? specificPrompt : null;
    const directPrompt = forwardedPrompt || jobContext.competitorPrompt;

    const industry = brief.industry || 'general market';
    const features = Array.isArray(brief.keyFeatures) ? brief.keyFeatures : [];
    const competitorScope = brief.competitorScope || 'All levels';
    const marketAnalysisRegion = brief.marketAnalysisRegion || 'Global';

    const constructedPrompt = [
      `Industry: ${industry}`,
      features.length ? `Features: ${features.join(', ')}` : '',
      `Scope: ${competitorScope}`,
      `Region: ${marketAnalysisRegion}`,
    ].filter(Boolean).join(' | ');

    const prompt = directPrompt || constructedPrompt;

    let lamatic;
    try {
      lamatic = await executeCompetitorWorkflow(prompt);
    } catch (e) {
      // Fallback to mock
      const competitors = this.getMockCompetitors(industry, features);
      return {
        error: `Lamatic competitor workflow failed: ${e.message}`,
        industry,
        competitors,
        monitoringPlan: ['Keyword alerts', 'Pricing page checks', 'SEO tracking'],
        competitorScope,
        marketAnalysisRegion,
        analysisDepth: `Focused on ${competitorScope} in ${marketAnalysisRegion}`,
        lamaticStatus: 'error',
        raw: null,
        promptUsed: prompt,
        specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
      };
    }

    const parsed = lamatic.parsed || {};
    const output = parsed.Output || parsed;

    // Heuristic field extraction
    const competitorsExtracted = output.competitors || output.Competitors || output.market_players || [];
    const positioning = output.positioning || output.Positioning || null;
    const differentiation = output.differentiation || output.Differentiation || null;
    const pricingModels = output.pricing_models || output.pricing || [];
    const threatAssessment = output.threats || output.Threats || output.risks || [];

    // Normalize competitors to array of objects
    const normalizedCompetitors = Array.isArray(competitorsExtracted)
      ? competitorsExtracted.map(c => (typeof c === 'string' ? { name: c } : c))
      : this.getMockCompetitors(industry, features);

    // Monitoring plan enhanced by scope
    let monitoringPlan = ['Track pricing updates', 'Monitor feature launches', 'Follow partnership news'];
    if (competitorScope.toLowerCase().includes('global')) monitoringPlan.push('Monitor international expansion');
    if (competitorScope.toLowerCase().includes('local')) monitoringPlan.push('Track local press & directories');

    return {
      lamaticStatus: lamatic.status,
      raw: lamatic.raw,
      promptUsed: prompt,
      industry,
      competitors: normalizedCompetitors,
      positioning,
      differentiation,
      pricingModels,
      threatAssessment,
      monitoringPlan,
      competitorScope,
      marketAnalysisRegion,
      analysisDepth: `Focused on ${competitorScope} in ${marketAnalysisRegion}`,
      specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
    };
  }
}

module.exports = { competitorAgent: new CompetitorAgent() };
