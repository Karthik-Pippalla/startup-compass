require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { competitorAgent } = require('./src/services/agents/competitorAgent');
const { executeCompetitorWorkflow } = require('./src/config/lamaticClient');

(async () => {
  try {
    const prompt = 'AI-powered dating app competitor landscape';

    console.log('--- Running competitorAgent.execute() with prompt ---');
    const agentOutput = await competitorAgent.execute({ competitorPrompt: prompt, validatedBrief: { industry: 'Dating', keyFeatures: ['AI matching', 'Realtime chat', 'Profile verification'] }, specificPrompt: null });
    console.log('Agent Output:', JSON.stringify(agentOutput, null, 2));

    console.log('\n--- Running executeCompetitorWorkflow() directly ---');
    const workflowRes = await executeCompetitorWorkflow(prompt);
    console.log('Workflow Status:', workflowRes.status);
    console.log('Workflow Raw:', workflowRes.raw);
    console.log('Workflow Parsed:', JSON.stringify(workflowRes.parsed, null, 2));
  } catch (e) {
    console.error('Test failed:', e.message);
  }
})();
