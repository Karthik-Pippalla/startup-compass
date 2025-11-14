const mongoose = require('mongoose');

const QuestionnaireQuestionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    helpText: { type: String },
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'tags', 'number'],
      default: 'text',
    },
    options: [{ label: String, value: String }],
  },
  { _id: false },
);

const AgentOutputSchema = new mongoose.Schema(
  {
    agent: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'running', 'succeeded', 'failed'],
      default: 'pending',
    },
    payload: mongoose.Schema.Types.Mixed,
    error: mongoose.Schema.Types.Mixed,
    startedAt: Date,
    finishedAt: Date,
  },
  { _id: false },
);

const JobSchema = new mongoose.Schema(
  {
    originalPrompt: {
      summary: { type: String, required: true },
      metadata: mongoose.Schema.Types.Mixed,
    },
    validatedBrief: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    questionnaire: {
      questions: {
        type: [QuestionnaireQuestionSchema],
        default: [],
      },
      answers: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    missingFields: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'collecting_info', 'ready', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    agentOutputs: {
      type: [AgentOutputSchema],
      default: [],
    },
    timeline: mongoose.Schema.Types.Mixed,
    history: {
      type: [
        {
          timestamp: { type: Date, default: Date.now },
          message: String,
          payload: mongoose.Schema.Types.Mixed,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Job', JobSchema);
