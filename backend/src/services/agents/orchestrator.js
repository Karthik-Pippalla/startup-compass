const AgentRun = require('../../models/AgentRun');
const Job = require('../../models/Job');
const { marketingAgent } = require('./marketingAgent');
const { developerAgent } = require('./developerAgent');
const { fundingAgent } = require('./fundingAgent');
const { competitorAgent } = require('./competitorAgent');
const { checklistAgent } = require('./checklistAgent');

const STRATEGY_AGENTS = [
  marketingAgent,
  developerAgent,
  fundingAgent,
  competitorAgent,
  checklistAgent,
];

const updateAgentOutputs = (job, agentName, partial) => {
  const outputs = job.agentOutputs || [];
  const otherOutputs = outputs.filter((item) => item.agent !== agentName);
  const merged = {
    agent: agentName,
    status: partial.status,
    payload: partial.payload,
    error: partial.error,
    startedAt: partial.startedAt,
    finishedAt: partial.finishedAt,
  };
  job.agentOutputs = [...otherOutputs, merged];
  job.markModified('agentOutputs');
};

const runAgentWithLogging = async (job, agentInstance) => {
  const run = await AgentRun.create({
    jobId: job.id,
    agent: agentInstance.name,
    status: 'running',
    startedAt: new Date(),
  });

  const startedAt = new Date();

  try {
    updateAgentOutputs(job, agentInstance.name, {
      status: 'running',
      startedAt,
    });
    await job.save();

    const payload = await agentInstance.execute(job);

    const finishedAt = new Date();
    updateAgentOutputs(job, agentInstance.name, {
      status: 'succeeded',
      payload,
      startedAt,
      finishedAt,
    });
    await job.save();

    run.status = 'succeeded';
    run.durationMs = finishedAt.getTime() - startedAt.getTime();
    run.response = payload;
    await run.save();

    return payload;
  } catch (error) {
    updateAgentOutputs(job, agentInstance.name, {
      status: 'failed',
      error: error.message || error,
      startedAt,
      finishedAt: new Date(),
    });
    await job.save();

    run.status = 'failed';
    run.error = { message: error.message };
    await run.save();

    throw error;
  }
};

const runStrategicAgents = async (jobId) => {
  const job = typeof jobId === 'string' ? await Job.findById(jobId) : jobId;
  if (!job) {
    throw new Error('Job not found');
  }

  job.status = 'running';
  job.history.push({ message: 'Started downstream agents with enhanced validation prompts' });
  await job.save();

  // Separate core agents from checklist agent (checklist depends on other outputs)
  const coreAgents = STRATEGY_AGENTS.filter(agent => agent.name !== 'checklist');
  const checklistAgentInstance = STRATEGY_AGENTS.find(agent => agent.name === 'checklist');

  // Run core agents in parallel
  console.log('🚀 Running core agents in parallel:', coreAgents.map(a => a.name).join(', '));
  
  const agentPromises = coreAgents.map(agent => {
    console.log(`Starting agent: ${agent.name} with enhanced validation`);
    
    // Add the specific prompt to the job context before running the agent
    const jobContextWithPrompt = {
      ...job.toObject(),
      specificPrompt: job.agentPrompts?.[agent.name] || null
    };
    
    return runAgentWithLogging(jobContextWithPrompt, agent);
  });

  // Wait for all core agents to complete
  try {
    await Promise.all(agentPromises);
    console.log('✅ All core agents completed');
  } catch (error) {
    console.error('❌ Some agents failed:', error);
    // Continue execution even if some agents fail
  }

  // Run checklist agent after core agents complete (it needs their outputs)
  if (checklistAgentInstance) {
    console.log('📋 Running checklist agent after core agents completion');
    
    // Refresh job data to get latest agent outputs
    const updatedJob = await Job.findById(job.id);
    const jobContextWithPrompt = {
      ...updatedJob.toObject(),
      specificPrompt: updatedJob.agentPrompts?.checklist || null
    };
    
    const checklistPayload = await runAgentWithLogging(jobContextWithPrompt, checklistAgentInstance);
    updatedJob.timeline = checklistPayload;
    await updatedJob.save();
  }

  // Mark job as completed
  const finalJob = await Job.findById(job.id);
  finalJob.status = 'completed';
  finalJob.history.push({ message: 'All agents finished successfully (parallel execution)' });
  await finalJob.save();

  return finalJob;
};

module.exports = { runStrategicAgents, runAgentWithLogging };
