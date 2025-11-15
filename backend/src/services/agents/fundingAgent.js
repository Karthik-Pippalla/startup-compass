const BaseAgent = require('./baseAgent');
const { executeFundingWorkflow } = require('../../config/lamaticClient');

// Helper: parse markdown-like summary sections
const parseSummary = (summary = '') => {
  const clean = summary.replace(/\r/g, '');
  const sections = {};
  const capture = (label, pattern) => {
    const match = clean.match(pattern);
    if (match) sections[label] = match[1].trim();
  };
  // Executive Summary
  capture('executiveSummary', /\*\*1\. Executive Summary\*\*[\n\s]*([\s\S]*?)(?=\*\*2\.|$)/i);
  // Immediate Opportunities
  capture('immediateOpportunitiesRaw', /\*\*2\. Immediate Opportunities[\s\S]*?\*\*[\n\s]*([\s\S]*?)(?=\*\*3\.|$)/i);
  // Rolling/Ongoing
  capture('rollingOpportunitiesRaw', /\*\*3\. Rolling\/Ongoing Opportunities\*\*[\n\s]*([\s\S]*?)(?=\*\*4\.|$)/i);
  // Recommended Next Steps
  capture('recommendedNextStepsRaw', /\*\*4\. Recommended Next Steps\*\*[\n\s]*([\s\S]*?)(?=$)/i);

  const listify = (raw) => (raw ? raw.split(/\n\s*\*|\n\s*\d+\./).map(s => s.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean) : []);

  return {
    executiveSummary: sections.executiveSummary || '',
    immediateOpportunities: listify(sections.immediateOpportunitiesRaw),
    rollingOpportunities: listify(sections.rollingOpportunitiesRaw),
    recommendedNextSteps: listify(sections.recommendedNextStepsRaw),
  };
};

class FundingAgent extends BaseAgent {
  constructor() {
    super('funding');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const specificPrompt = jobContext.specificPrompt;

    // Build idea text from brief fields (include ideaName & problem)
    const ideaParts = [
      brief.ideaName,
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
        executiveSummary: '',
        immediateOpportunities: [],
        rollingOpportunities: [],
        recommendedNextSteps: [],
      };
    }

    const parsed = workflowResult.parsed || {};
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

    // Parse summary if provided
    const summarySource = parsed.Summary || parsed.summary || workflowResult.raw?.Summary || workflowResult.raw?.summary || '';
    const summarySections = parseSummary(summarySource);

    // Basic keyword extraction from summary if matches empty
    const keywordSet = new Set();
    summarySource.toLowerCase().split(/[^a-z0-9+]+/).forEach(tok => {
      if (tok.length > 4) keywordSet.add(tok);
    });
    const derivedKeywords = Array.from(keywordSet).slice(0, 15);

    return {
      matches,
      lamaticStatus: workflowResult.status,
      raw: workflowResult.raw,
      specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
      executiveSummary: summarySections.executiveSummary,
      immediateOpportunities: summarySections.immediateOpportunities,
      rollingOpportunities: summarySections.rollingOpportunities,
      recommendedNextSteps: summarySections.recommendedNextSteps,
      keywords: matches.length ? matches.flatMap(m => m.keywords || []).slice(0, 15) : derivedKeywords,
    };
  }
}

module.exports = { fundingAgent: new FundingAgent() };
