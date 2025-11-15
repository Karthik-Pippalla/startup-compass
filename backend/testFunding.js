require('dotenv').config();
const { executeFundingWorkflow } = require('./src/config/lamaticClient');

(async () => {
  try {
    const idea = 'building a biotech startup that focuses on innovative cancer treatments';
    const res = await executeFundingWorkflow(idea);
    console.log('Lamatic workflow status:', res.status);
    console.log('Raw result:', res.raw);
    console.log('Parsed result:', res.parsed);
  } catch (e) {
    console.error('Error executing Lamatic workflow:', e.message);
  }
})();