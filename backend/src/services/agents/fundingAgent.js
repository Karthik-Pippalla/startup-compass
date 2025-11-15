const BaseAgent = require('./baseAgent');
const Funder = require('../../models/Funder');
const { extractKeywords, normalizeList } = require('../../utils/text');

const scoreFunder = (funderKeywords, promptKeywords) => {
  const promptSet = new Set(promptKeywords);
  const overlap = funderKeywords.filter((kw) => promptSet.has(kw.toLowerCase()));
  return overlap.length / Math.max(promptSet.size, 1);
};

class FundingAgent extends BaseAgent {
  constructor() {
    super('funding');
  }

  async execute(jobContext) {
    const brief = jobContext.validatedBrief || {};
    const specificPrompt = jobContext.specificPrompt;
    const keywordSources = [
      brief.industry,
      brief.productDescription,
      brief.problemStatement,
      ...(normalizeList(brief.keyFeatures) || []),
    ].filter(Boolean);

    const promptKeywords = Array.from(
      new Set(keywordSources.flatMap((source) => extractKeywords(source))),
    );

    const funders = await Funder.find({ keywords: { $in: promptKeywords } }).limit(10);

    if (!funders.length) {
      return {
        matches: [],
        keywords: promptKeywords,
        note: 'No funders matched the provided keywords. Seed the database to enable funding insights.',
        specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
      };
    }

    const matches = funders
      .map((funder) => {
        const funderKeywords = (funder.keywords || []).map((kw) => kw.toLowerCase());
        return {
          id: funder.id,
          name: funder.name,
          contact: funder.contact,
          stageFocus: funder.stageFocus,
          geography: funder.geography,
          score: scoreFunder(funderKeywords, promptKeywords),
          keywords: funder.keywords,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { 
      matches, 
      keywords: promptKeywords,
      specificPrompt: specificPrompt ? 'Used enhanced validation prompt' : 'Used default analysis',
    };
  }
}

module.exports = { fundingAgent: new FundingAgent() };
