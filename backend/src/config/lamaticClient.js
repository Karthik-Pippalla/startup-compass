const axios = require('axios');
// Explicitly load backend/.env regardless of process.cwd()
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const LAMATIC_API_KEY = process.env.LAMATIC_API_KEY;
const LAMATIC_PROJECT_ID = process.env.LAMATIC_PROJECT_ID || 'bd5d1289-1c2e-4042-8084-f6a3f9153d2b';
const FUNDING_WORKFLOW_ID = process.env.LAMATIC_FUNDING_WORKFLOW_ID || '57bfe813-3b97-477c-8e71-5460a3ab25a5';
const LAMATIC_ENDPOINT = 'https://fausorganization106-c2acalendarsyncremagent612.lamatic.dev/graphql';
const LAMATIC_API_KEY_1 = process.env.LAMATIC_API_KEY_1;

const FUNDING_WORKFLOW_QUERY = `
query ExecuteWorkflow(
  $workflowId: String!
  $idea: String
) {
  executeWorkflow(
    workflowId: $workflowId
    payload: { idea: $idea }
  ) {
    status
    result
  }
}`;

async function executeFundingWorkflow(idea) {
  if (!LAMATIC_API_KEY) {
    throw new Error('LAMATIC_API_KEY not set in environment');
  }

  const variables = {
    workflowId: FUNDING_WORKFLOW_ID,
    idea: idea || 'No idea provided',
  };

  const options = {
    method: 'POST',
    url: LAMATIC_ENDPOINT,
    headers: {
      Authorization: `Bearer ${LAMATIC_API_KEY}`,
      'Content-Type': 'application/json',
      'x-project-id': LAMATIC_PROJECT_ID,
    },
    data: { query: FUNDING_WORKFLOW_QUERY, variables },
    timeout: 30000,
  };

  const response = await axios(options);
  const gql = response.data;
  if (gql.errors) {
    throw new Error(gql.errors.map(e => e.message).join('; '));
  }
  const exec = gql.data?.executeWorkflow;
  if (!exec) {
    throw new Error('Lamatic response missing executeWorkflow field');
  }

  let result = exec.result;
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result);
    } catch (_) {}
  }
  return { status: exec.status, raw: exec.result, parsed: result };
}

// Developer flow configuration
const DEVELOPER_PROJECT_ID = process.env.LAMATIC_DEV_PROJECT_ID || 'a68d7af5-534c-4bd1-8c7a-7999418d3ea3';
const DEVELOPER_WORKFLOW_ID = process.env.LAMATIC_DEVELOPER_WORKFLOW_ID || 'a254a176-2ca8-4f28-8a82-0f8ff2e027a9';
const DEVELOPER_ENDPOINT = process.env.LAMATIC_DEV_ENDPOINT || 'https://vaibhavsorganization466-vaibhavsproject304.lamatic.dev/graphql';

const DEVELOPER_WORKFLOW_QUERY = `
query ExecuteWorkflow(
  $workflowId: String!
  $InputforTA: String
) {
  executeWorkflow(
    workflowId: $workflowId
    payload: { InputforTA: $InputforTA }
  ) {
    status
    result
  }
}`;

async function executeDeveloperWorkflow(input) {
  const apiKey1 = LAMATIC_API_KEY_1;
  if (!apiKey1) throw new Error('LAMATIC_API_KEY_1 (developer workflow key) not set in environment');

  const variables = {
    workflowId: DEVELOPER_WORKFLOW_ID,
    InputforTA: input || 'No input provided',
  };

  const options = {
    method: 'POST',
    url: DEVELOPER_ENDPOINT,
    headers: {
      Authorization: `Bearer ${apiKey1}`,
      'Content-Type': 'application/json',
      'x-project-id': DEVELOPER_PROJECT_ID,
    },
    data: { query: DEVELOPER_WORKFLOW_QUERY, variables },
    timeout: 30000,
  };

  const response = await axios(options);
  const gql = response.data;
  if (gql.errors) {
    throw new Error(gql.errors.map(e => e.message).join('; '));
  }
  const exec = gql.data?.executeWorkflow;
  if (!exec) throw new Error('Lamatic developer response missing executeWorkflow field');

  let result = exec.result;
  if (typeof result === 'string') {
    try { result = JSON.parse(result); } catch (_) {}
  }
  return { status: exec.status, raw: exec.result, parsed: result };
}

// Marketing flow configuration
const MARKETING_WORKFLOW_ID = process.env.LAMATIC_MARKETING_WORKFLOW_ID || '1e0aa134-aafb-4242-a2ae-92630ab6eba8';
const MARKETING_ENDPOINT = process.env.LAMATIC_MARKETING_ENDPOINT || DEVELOPER_ENDPOINT;
const MARKETING_PROJECT_ID = process.env.LAMATIC_MARKETING_PROJECT_ID || DEVELOPER_PROJECT_ID;
const LAMATIC_API_KEY_2 = process.env.LAMATIC_API_KEY_2; // marketing key candidate
const LAMATIC_MARKETING_API_KEY = process.env.LAMATIC_MARKETING_API_KEY; // explicit override

const MARKETING_WORKFLOW_QUERY = `
query ExecuteWorkflow(
  $workflowId: String!
  $user_input: String
) {
  executeWorkflow(
    workflowId: $workflowId
    payload: { user_input: $user_input }
  ) {
    status
    result
  }
}`;

async function executeMarketingWorkflow(prompt) {
  // Prefer developer key (proven valid for this project), then generic, then key 2
  const apiKey = LAMATIC_MARKETING_API_KEY || LAMATIC_API_KEY_1 || LAMATIC_API_KEY || LAMATIC_API_KEY_2;
  if (!apiKey) throw new Error('No Lamatic API key available for marketing workflow');

  const variables = {
    workflowId: MARKETING_WORKFLOW_ID,
    user_input: prompt || 'No prompt provided',
  };

  const options = {
    method: 'POST',
    url: MARKETING_ENDPOINT,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-project-id': MARKETING_PROJECT_ID,
    },
    data: { query: MARKETING_WORKFLOW_QUERY, variables },
    timeout: 30000,
  };

  try {
    const response = await axios(options);
    const gql = response.data;
    if (gql.errors) throw new Error(gql.errors.map(e => e.message).join('; '));
    const exec = gql.data?.executeWorkflow;
    if (!exec) throw new Error('Lamatic marketing response missing executeWorkflow field');
    let result = exec.result;
    if (typeof result === 'string') { try { result = JSON.parse(result); } catch (_) {} }
    return { status: exec.status, raw: exec.result, parsed: result };
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      throw new Error(`HTTP ${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }
    throw err;
  }
}

// Competitor flow configuration
const COMPETITOR_WORKFLOW_ID = process.env.LAMATIC_COMPETITOR_WORKFLOW_ID || '1e0aa134-aafb-4242-a2ae-92630ab6eba8';
const COMPETITOR_ENDPOINT = process.env.LAMATIC_COMPETITOR_ENDPOINT || MARKETING_ENDPOINT;
const COMPETITOR_PROJECT_ID = process.env.LAMATIC_COMPETITOR_PROJECT_ID || MARKETING_PROJECT_ID;

const COMPETITOR_WORKFLOW_QUERY = `
query ExecuteWorkflow(
  $workflowId: String!
  $user_input: String
) {
  executeWorkflow(
    workflowId: $workflowId
    payload: { user_input: $user_input }
  ) {
    status
    result
  }
}`;

async function executeCompetitorWorkflow(prompt) {
  const apiKey = LAMATIC_MARKETING_API_KEY || LAMATIC_API_KEY_1 || LAMATIC_API_KEY || LAMATIC_API_KEY_2;
  if (!apiKey) throw new Error('No Lamatic API key available for competitor workflow');

  const variables = { workflowId: COMPETITOR_WORKFLOW_ID, user_input: prompt || 'No prompt provided' };
  const options = {
    method: 'POST',
    url: COMPETITOR_ENDPOINT,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-project-id': COMPETITOR_PROJECT_ID,
    },
    data: { query: COMPETITOR_WORKFLOW_QUERY, variables },
    timeout: 30000,
  };
  const response = await axios(options);
  const gql = response.data;
  if (gql.errors) throw new Error(gql.errors.map(e => e.message).join('; '));
  const exec = gql.data?.executeWorkflow;
  if (!exec) throw new Error('Lamatic competitor response missing executeWorkflow field');
  let result = exec.result; if (typeof result === 'string') { try { result = JSON.parse(result); } catch (_) {} }
  return { status: exec.status, raw: exec.result, parsed: result };
}

module.exports = { executeFundingWorkflow, executeDeveloperWorkflow, executeMarketingWorkflow, executeCompetitorWorkflow };