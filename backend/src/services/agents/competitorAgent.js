const BaseAgent = require('./baseAgent');

class CompetitorAgent extends BaseAgent {
  constructor() {
    super('competitor');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const industry = brief.industry || 'general market';
    const features = brief.keyFeatures || [];

    // Placeholder for scraping pipeline; returns mocked insights for now.
    const competitors = features.slice(0, 3).map((feature, index) => ({
      name: `${industry} competitor ${index + 1}`,
      differentiator: `Focuses on ${feature}`,
      pricing: 'Custom',
    }));

    if (!competitors.length) {
      competitors.push({
        name: `${industry} incumbent`,
        differentiator: 'Owns mindshare but slow to innovate',
        pricing: 'Enterprise',
      });
    }

    return {
      industry,
      competitors,
      monitoringPlan: [
        'Set up keyword alerts for new launches',
        'Aggregate pricing pages monthly',
        'Track SEO metrics for top competitors',
      ],
    };
  }
}

module.exports = { competitorAgent: new CompetitorAgent() };
