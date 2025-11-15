const BaseAgent = require('./baseAgent');
const { executeFundingWorkflow } = require('../../config/lamaticClient');

class FundingAgent extends BaseAgent {
  constructor() {
    super('funding');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const specificPrompt = jobContext.specificPrompt;

    // Build idea text from brief fields
    const ideaParts = [
      brief.industry,
      brief.productDescription,
      brief.problemStatement,
      Array.isArray(brief.keyFeatures) ? brief.keyFeatures.join(', ') : undefined,
    ].filter(Boolean);
    const idea = ideaParts.join(' | ');

    let workflowResult;
    try {
      workflowResult = await executeFundingWorkflow(idea);
    } catch (err) {
      return {
        matches: [],
        error: `Lamatic workflow failed: ${err.message}`,
        specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
      };
    }

    const parsed = workflowResult.parsed || {};
    // Expect funders list in parsed.funders or parsed.result or similar; attempt flexible extraction
    const funderList = parsed.funders || parsed.funderList || parsed.result || parsed.data || [];

    const matches = (Array.isArray(funderList) ? funderList : []).map(f => ({
      id: f.id || f._id || f.name,
      name: f.name || f.title || 'Unknown Funder',
      contact: f.contact || { email: f.email, website: f.website },
      stageFocus: f.stageFocus || f.stage || [],
      geography: f.geography || f.location || [],
      score: f.score || f.matchScore || null,
      keywords: f.keywords || [],
    })).slice(0, 5);

    return {
      matches,
      lamaticStatus: workflowResult.status,
      raw: workflowResult.raw,
      specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
    };
  }
}

module.exports = { fundingAgent: new FundingAgent() };
