require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { marketingAgent } = require('./src/services/agents/marketingAgent');
const { executeMarketingWorkflow } = require('./src/config/lamaticClient');

(async () => {
  try {
    const prompt = 'dating app using agentic ai to match couple';

    console.log('--- Running marketingAgent.execute() with prompt ---');
    const agentOutput = await marketingAgent.execute({ marketingPrompt: prompt, validatedBrief: {}, specificPrompt: null });
    console.log('Agent Output:', JSON.stringify(agentOutput, null, 2));

    console.log('\n--- Running executeMarketingWorkflow() directly ---');
    const workflowRes = await executeMarketingWorkflow(prompt);
    console.log('Workflow Status:', workflowRes.status);
    console.log('Workflow Raw:', workflowRes.raw);
    console.log('Workflow Parsed:', JSON.stringify(workflowRes.parsed, null, 2));
  } catch (e) {
    console.error('Test failed:', e.message);
  }
})();
