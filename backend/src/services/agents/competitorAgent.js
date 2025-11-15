const BaseAgent = require('./baseAgent');
const { executeCompetitorWorkflow } = require('../../config/lamaticClient');
const { selectPrompt } = require('./utils/selectPrompt');

class CompetitorAgent extends BaseAgent {
  constructor() {
    super('competitor');
  }

  async execute(jobContext) {
    const prompt = selectPrompt(jobContext, jobContext.competitorPrompt);
    const safePrompt = prompt || 'No prompt provided';

    try {
      const lamatic = await executeCompetitorWorkflow(safePrompt);
      return {
        raw: lamatic.raw,
        lamaticStatus: lamatic.status,
        promptUsed: safePrompt,
      };
    } catch (e) {
      return {
        raw: null,
        lamaticStatus: 'error',
        promptUsed: safePrompt,
        error: `Lamatic competitor workflow failed: ${e.message}`,
      };
    }
  }
}

module.exports = { competitorAgent: new CompetitorAgent() };
