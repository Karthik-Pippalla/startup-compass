const BaseAgent = require('./baseAgent');
const { normalizeList } = require('../../utils/text');

class DeveloperAgent extends BaseAgent {
  constructor() {
    super('developer');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const specificPrompt = jobContext.specificPrompt;
    const features = normalizeList(brief.keyFeatures);
    const constraints = normalizeList(brief.technicalConstraints);
    
    // Enhanced technical analysis based on validation
    const technologyPreference = brief.technologyPreference || '';
    const technicalExpertise = brief.technicalExpertise || 'Intermediate';

    let stack = {
      frontend: 'React + Vite + TypeScript',
      backend: 'Node.js (Express or Fastify)',
      database: 'MongoDB Atlas',
      hosting: 'Firebase Hosting + Cloud Functions',
      integrations: constraints,
    };

    // Adjust stack based on technology preferences
    if (technologyPreference.toLowerCase().includes('python')) {
      stack.backend = 'Python (FastAPI or Django)';
      stack.hosting = 'AWS Lambda + API Gateway or Heroku';
    } else if (technologyPreference.toLowerCase().includes('java')) {
      stack.backend = 'Java (Spring Boot)';
      stack.hosting = 'AWS Elastic Beanstalk or Google Cloud Run';
    } else if (technologyPreference.toLowerCase().includes('php')) {
      stack.backend = 'PHP (Laravel or Symfony)';
      stack.hosting = 'DigitalOcean or AWS EC2';
    }

    // Adjust complexity based on technical expertise
    let milestones;
    if (technicalExpertise === 'Non-technical' || technicalExpertise === 'Basic') {
      milestones = [
        { name: 'No-code/low-code solution research', durationWeeks: 1 },
        { name: 'MVP using no-code tools', durationWeeks: 2 },
        { name: 'Testing and deployment', durationWeeks: 1 },
      ];
      stack.recommendation = 'Consider no-code solutions like Bubble, Webflow, or Airtable';
    } else if (technicalExpertise === 'Expert' || technicalExpertise === 'Advanced') {
      milestones = [
        { name: 'Advanced architecture design', durationWeeks: 1 },
        { name: 'Core feature implementation with advanced patterns', durationWeeks: 4 },
        { name: 'Performance optimization & testing', durationWeeks: 2 },
        { name: 'DevOps & CI/CD setup', durationWeeks: 1 },
      ];
    } else {
      milestones = [
        { name: 'Foundational architecture', durationWeeks: 1 },
        { name: 'Core feature implementation', durationWeeks: 3 },
        { name: 'Integrations & QA', durationWeeks: 2 },
      ];
    }

    const risks = [
      'Ambiguous scope for key features',
      'Data access or compliance requirements not defined',
      'Third-party dependency readiness',
    ];

    // Add expertise-specific risks
    if (technicalExpertise === 'Non-technical') {
      risks.push('Need for technical co-founder or development team');
      risks.push('Learning curve for no-code platforms');
    } else if (technicalExpertise === 'Expert') {
      risks.push('Over-engineering the initial MVP');
      risks.push('Time spent on optimization vs. market validation');
    }

    return {
      stack,
      apiDesign: features.map((feature, index) => ({
        name: `${feature}-api-${index + 1}`,
        description: `Endpoints required to support ${feature}.`,
      })),
      deliveryPlan: milestones,
      risks,
      technicalExpertise,
      technologyPreference: technologyPreference || 'No specific preferences',
      specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
    };
  }
}

module.exports = { developerAgent: new DeveloperAgent() };
