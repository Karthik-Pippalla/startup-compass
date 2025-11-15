const BaseAgent = require('./baseAgent');
const { executeDeveloperWorkflow } = require('../../config/lamaticClient');
const { selectPrompt } = require('./utils/selectPrompt');

class DeveloperAgent extends BaseAgent {
  constructor() {
    super('developer');
  }

  async execute(jobContext) {
    const prompt = selectPrompt(jobContext, jobContext.developerPrompt);
    const safePrompt = prompt || 'No prompt provided';

    try {
      const result = await executeDeveloperWorkflow(safePrompt);
      return {
        raw: result.raw,
        lamaticStatus: result.status,
        promptUsed: safePrompt,
      };
    } catch (err) {
      return {
        raw: null,
        lamaticStatus: 'error',
        promptUsed: safePrompt,
        error: `Lamatic developer workflow failed: ${err.message}`,
      };
    }
  }
}

module.exports = { developerAgent: new DeveloperAgent() };
