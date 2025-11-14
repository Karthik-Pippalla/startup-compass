const BaseAgent = require('./baseAgent');
const { normalizeList } = require('../../utils/text');

class DeveloperAgent extends BaseAgent {
  constructor() {
    super('developer');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const features = normalizeList(brief.keyFeatures);
    const constraints = normalizeList(brief.technicalConstraints);

    const stack = {
      frontend: 'React + Vite + TypeScript',
      backend: 'Node.js (Express or Fastify)',
      database: 'MongoDB Atlas',
      hosting: 'Firebase Hosting + Cloud Functions',
      integrations: constraints,
    };

    const milestones = [
      { name: 'Foundational architecture', durationWeeks: 1 },
      { name: 'Core feature implementation', durationWeeks: 3 },
      { name: 'Integrations & QA', durationWeeks: 2 },
    ];

    const risks = [
      'Ambiguous scope for key features',
      'Data access or compliance requirements not defined',
      'Third-party dependency readiness',
    ];

    return {
      stack,
      apiDesign: features.map((feature, index) => ({
        name: `${feature}-api-${index + 1}`,
        description: `Endpoints required to support ${feature}.`,
      })),
      deliveryPlan: milestones,
      risks,
    };
  }
}

module.exports = { developerAgent: new DeveloperAgent() };
