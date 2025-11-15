const BaseAgent = require('./baseAgent');
const { executeFundingWorkflow } = require('../../config/lamaticClient');
const { selectPrompt } = require('./utils/selectPrompt');

class FundingAgent extends BaseAgent {
  constructor() {
    super('funding');
  }

  async execute(jobContext) {
    const prompt = selectPrompt(jobContext, jobContext.fundingPrompt);
    const safePrompt = prompt || 'No prompt provided';

    try {
      const workflowResult = await executeFundingWorkflow(safePrompt);
      return {
        raw: workflowResult.raw,
        lamaticStatus: workflowResult.status,
        promptUsed: safePrompt,
      };
    } catch (err) {
      return {
        raw: null,
        lamaticStatus: 'error',
        promptUsed: safePrompt,
        error: `Lamatic funding workflow failed: ${err.message}`,
      };
    }
  }
}

module.exports = { fundingAgent: new FundingAgent() };
