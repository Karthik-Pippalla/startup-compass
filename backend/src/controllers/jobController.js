const Job = require('../models/Job');
const Collabration = require('../models/Collabration');
const { validationAgent } = require('../services/agents/validationAgent');
const { runStrategicAgents } = require('../services/agents/orchestrator');

const mapBodyToAnswers = (data = {}) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const applyValidation = async (job) => {
  const validationResult = await validationAgent.execute(job);
  job.validatedBrief = validationResult.validatedBrief;
  job.questionnaire.questions = validationResult.questions;
  job.missingFields = validationResult.missingFields;
  job.agentPrompts = validationResult.agentPrompts; // Store generated prompts

  // Ensure answers remains a Map (handles legacy docs saved as plain objects)
  if (job.questionnaire) {
    const currentAnswers = job.questionnaire.answers;
    if (currentAnswers && !(currentAnswers instanceof Map)) {
      try {
        job.questionnaire.answers = new Map(Object.entries(currentAnswers));
      } catch {
        job.questionnaire.answers = new Map();
      }
      job.markModified('questionnaire.answers');
    }
  }

  // Seed agent output placeholders when validation complete and not already seeded
  if (validationResult.status === 'complete' && (!job.agentOutputs || job.agentOutputs.length === 0)) {
    const AGENTS = ['marketing', 'developer', 'funding', 'competitor', 'checklist'];
    job.agentOutputs = AGENTS.map(a => ({ agent: a, status: 'pending' }));
  }

  job.status =
    validationResult.status === 'complete' ? (job.status === 'running' ? 'running' : 'ready') : 'collecting_info';
  job.history.push({
    message:
      validationResult.status === 'complete'
        ? 'Validation complete - Agent prompts generated'
        : `Validation needs info: ${validationResult.missingFields.join(', ')}`,
  });

  await job.save();
  return validationResult.status;
};

const scheduleAgentPipeline = (jobId) => {
  setImmediate(() => {
    runStrategicAgents(jobId).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Agent pipeline failed', error);
    });
  });
};

const createJob = async (req, res, next) => {
  try {
    const { prompt, metadata, brief } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const answers = mapBodyToAnswers(brief);

    const job = await Job.create({
      originalPrompt: { summary: prompt, metadata },
      validatedBrief: answers,
      questionnaire: {
        answers: new Map(Object.entries(answers || {})), // ensure Map type
      },
      status: 'pending',
    });

    const validationStatus = await applyValidation(job);

    if (validationStatus === 'complete') {
      scheduleAgentPipeline(job.id);
    }

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

const submitAnswers = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const answers = mapBodyToAnswers(req.body.answers);

    // Safely merge into mongoose Map or plain object
    if (job.questionnaire && job.questionnaire.answers instanceof Map) {
      Object.entries(answers).forEach(([key, value]) => {
        job.questionnaire.answers.set(key, value);
      });
      job.markModified('questionnaire.answers');
    } else {
      const current = (job.questionnaire && job.questionnaire.answers) || {};
      job.questionnaire.answers = { ...current, ...answers };
    }

    // Also update validatedBrief (plain object)
    job.validatedBrief = { ...(job.validatedBrief || {}), ...answers };

    const validationStatus = await applyValidation(job);

    if (validationStatus === 'complete') {
      scheduleAgentPipeline(job.id);
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

const submitcollabration = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to submit a collabration' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Job must be completed before submitting a collabration' });
    }

    const existing = await Collabration.findOne({ jobId: job._id, userId });
    if (existing) {
      return res.json({ collabration: existing, alreadySubmitted: true });
    }

    const collabration = await Collabration.create({
      jobId: job._id,
      userId,
      originalPrompt: job.originalPrompt?.summary,
      validatedBrief: job.validatedBrief,
      agentOutputs: job.agentOutputs,
      timeline: job.timeline,
    });

    return res.status(201).json({ collabration, alreadySubmitted: false });
  } catch (error) {
    if (error.code === 11000) {
      try {
        const fallBack = await Collabration.findOne({ jobId: req.params.jobId, userId: req.body.userId });
        if (fallBack) {
          return res.json({ collabration: fallBack, alreadySubmitted: true });
        }
      } catch (findError) {
        // eslint-disable-next-line no-console
        console.error('Error fetching duplicate collabration', findError);
      }
    }
    next(error);
  }
};

const listCollabrations = async (req, res, next) => {
  try {
    const collabrations = await Collabration.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName displayName email phoneNumber');
    res.json(collabrations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJob,
  submitAnswers,
  submitcollabration,
  listCollabrations,
};
