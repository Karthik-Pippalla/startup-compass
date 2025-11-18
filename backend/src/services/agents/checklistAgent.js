const BaseAgent = require('./baseAgent');
const { generateTimelinePlan } = require('../ai/generateTimelinePlan');

class ChecklistAgent extends BaseAgent {
  constructor() {
    super('checklist');
  }

  async execute(jobContext) {
    return generateTimelinePlan(jobContext);
  }
}

module.exports = { checklistAgent: new ChecklistAgent() };
