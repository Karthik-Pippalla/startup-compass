require('dotenv').config();
const { developerAgent } = require('./src/services/agents/developerAgent');
const { executeDeveloperWorkflow } = require('./src/config/lamaticClient');

(async () => {
  try {
    const prompt = 'building a massive, general-purpose AI tool, create a Software as a Service (SaaS) platform that uses AI to solve one very specific, complex, and recurring workflow problem for a highly targeted niche.The product acts as an always-on, automated, expert consultant for that single task.';

    console.log('--- Running developerAgent.execute() with prompt ---');
    const agentOutput = await developerAgent.execute({ visionSentence: prompt, validatedBrief: {}, specificPrompt: null });
    console.log('Agent Output:', JSON.stringify(agentOutput, null, 2));

    console.log('\n--- Running executeDeveloperWorkflow() directly with prompt ---');
    const workflowRes = await executeDeveloperWorkflow(prompt);
    console.log('Workflow Status:', workflowRes.status);
    console.log('Workflow Raw:', workflowRes.raw);
    console.log('Workflow Parsed:', JSON.stringify(workflowRes.parsed, null, 2));
  } catch (e) {
    console.error('Test failed:', e.message);
  }
})();
