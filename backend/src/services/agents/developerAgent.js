const BaseAgent = require('./baseAgent');
const { executeDeveloperWorkflow } = require('../../config/lamaticClient');

class DeveloperAgent extends BaseAgent {
  constructor() {
    super('developer');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const specificPrompt = jobContext.specificPrompt;
    // Added vision / strategic focus sentence provided by user as fallback
    const visionSentence = jobContext.visionSentence || brief.visionSentence || 'Instead of building a massive, general-purpose AI tool, create a Software as a Service (SaaS) platform that uses AI to solve one very specific, complex, and recurring workflow problem for a highly targeted niche. The product acts as an always-on, automated, expert consultant for that single task.';

    // Build input string for Lamatic developer workflow (extended)
    const parts = [
      `Industry: ${brief.industry || ''}`,
      `Product: ${brief.productDescription || ''}`,
      `Problem: ${brief.problemStatement || ''}`,
      `Features: ${Array.isArray(brief.keyFeatures) ? brief.keyFeatures.join(', ') : (brief.keyFeatures || '')}`,
      `Tech Pref: ${brief.technologyPreference || ''}`,
      `Expertise: ${brief.technicalExpertise || ''}`,
      `Vision: ${visionSentence}`,
    ].filter(Boolean).join(' | ');

    let result;
    try {
      result = await executeDeveloperWorkflow(parts);
    } catch (err) {
      return {
        stack: {},
        apiDesign: [],
        deliveryPlan: [],
        risks: [err.message],
        error: `Lamatic developer workflow failed: ${err.message}`,
        specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
      };
    }

    const parsed = result.parsed || {};

    // Helper to normalize comma separated strings to array
    const toArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'object') return Object.values(val).flat();
      return String(val).split(/[,\n]/).map(v => v.trim()).filter(Boolean);
    };

    // New Lamatic technology category mapping
    const frontendTechnologies = toArray(parsed.frontend_technologies);
    const backendTechnologies = toArray(parsed.backend_technologies);
    const sqlDatabases = toArray(parsed.sql_databases);
    const noSqlDatabases = toArray(parsed.nosql_databases);
    const authenticationAndAuthorization = toArray(parsed.authentication_and_authorization);
    const devOpsAndDeployment = toArray(parsed.devops_and_deployment);
    const apisAndIntegrations = toArray(parsed.apis_and_integrations);
    const aiOrMl = toArray(parsed.ai_or_ml);
    const cloudServices = toArray(parsed.cloud_services);
    const optionalEnhancements = toArray(parsed.optional_enhancements);

    // Legacy mapping fallback
    const stackLegacy = parsed.stack || parsed.techStack || parsed.stackRecommendation || {};
    const apiDesignLegacy = parsed.apiDesign || parsed.endpoints || [];
    const deliveryPlanLegacy = parsed.deliveryPlan || parsed.milestones || [];
    const risksLegacy = parsed.risks || parsed.riskFactors || [];

    // Consolidated stack object combining new categories
    const stack = {
      frontend: frontendTechnologies,
      backend: backendTechnologies,
      sql: sqlDatabases,
      nosql: noSqlDatabases,
      auth: authenticationAndAuthorization,
      devops: devOpsAndDeployment,
      apis: apisAndIntegrations,
      ai_ml: aiOrMl,
      cloud: cloudServices,
      enhancements: optionalEnhancements,
      legacy: stackLegacy,
    };

    return {
      // New structured technology recommendations
      stack,
      frontendTechnologies,
      backendTechnologies,
      sqlDatabases,
      noSqlDatabases,
      authenticationAndAuthorization,
      devOpsAndDeployment,
      apisAndIntegrations,
      aiOrMl,
      cloudServices,
      optionalEnhancements,
      // Legacy fields preserved for backward compatibility
      apiDesign: Array.isArray(apiDesignLegacy) ? apiDesignLegacy : [],
      deliveryPlan: Array.isArray(deliveryPlanLegacy) ? deliveryPlanLegacy : [],
      risks: Array.isArray(risksLegacy) ? risksLegacy : [],
      technicalExpertise: brief.technicalExpertise || 'Unknown',
      technologyPreference: brief.technologyPreference || 'No specific preferences',
      visionSentence,
      lamaticStatus: result.status,
      raw: result.raw,
      specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
    };
  }
}

module.exports = { developerAgent: new DeveloperAgent() };
