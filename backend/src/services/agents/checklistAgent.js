const BaseAgent = require('./baseAgent');

class ChecklistAgent extends BaseAgent {
  constructor() {
    super('checklist');
  }

  async execute(jobContext) {
    const outputs = jobContext.agentOutputs || [];
    const marketing = outputs.find((output) => output.agent === 'marketing');
    const developer = outputs.find((output) => output.agent === 'developer');

    const phases = [
      {
        phase: 'Discovery',
        tasks: [
          'Confirm problem statement',
          'Validate personas',
          'Align on success metrics',
        ],
        durationWeeks: 1,
      },
      {
        phase: 'Build',
        tasks: ['Implement core features', 'Integrate data sources', 'QA + UAT'],
        durationWeeks: 4,
      },
      {
        phase: 'Launch',
        tasks: ['Deploy production stack', 'Launch marketing campaigns'],
        durationWeeks: 2,
      },
    ];

    return {
      phases,
      notes: {
        marketing: marketing?.payload?.narrative,
        engineering: developer?.payload?.stack,
      },
    };
  }
}

module.exports = { checklistAgent: new ChecklistAgent() };
