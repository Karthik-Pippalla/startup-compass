const BaseAgent = require('./baseAgent');
const { executeMarketingWorkflow } = require('../../config/lamaticClient');
const { selectPrompt } = require('./utils/selectPrompt');

class MarketingAgent extends BaseAgent {
  constructor() {
    super('marketing');
  }

  async execute(jobContext) {
    const prompt = selectPrompt(jobContext, jobContext.marketingPrompt);
    const safePrompt = prompt || 'No prompt provided';

    try {
      const lamatic = await executeMarketingWorkflow(safePrompt);
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
        error: `Lamatic marketing workflow failed: ${e.message}`,
      };
    }
  }
}

module.exports = { marketingAgent: new MarketingAgent() };
