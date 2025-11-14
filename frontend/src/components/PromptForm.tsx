import { useState } from 'react';
import type { CreateJobPayload } from '../types/job';

type PromptFormProps = {
  onSubmit: (payload: CreateJobPayload) => Promise<void>;
  disabled?: boolean;
};

const initialBrief = {
  productDescription: '',
  industry: '',
  targetAudience: '',
  problemStatement: '',
  keyFeatures: '',
  budgetRange: '',
  timeline: '',
  technicalConstraints: '',
  successMetrics: '',
};

export const PromptForm = ({ onSubmit, disabled }: PromptFormProps) => {
  const [prompt, setPrompt] = useState('');
  const [brief, setBrief] = useState(initialBrief);
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) return;

    setSubmitting(true);
    try {
      const normalizedBrief = {
        ...brief,
        keyFeatures: brief.keyFeatures
          .split(',')
          .map((feature) => feature.trim())
          .filter(Boolean),
      };
      await onSubmit({ prompt, brief: normalizedBrief });
      setPrompt('');
      setBrief(initialBrief);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create a new workspace</h2>
      <label className="field">
        <span>Idea or Project Prompt *</span>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the idea in a few sentences"
          required
          disabled={submitting || disabled}
        />
      </label>

      <div className="grid">
        <label className="field">
          <span>Industry</span>
          <input
            value={brief.industry}
            onChange={(event) => handleFieldChange('industry', event.target.value)}
            placeholder="Fintech, Climate, Health..."
            disabled={submitting || disabled}
          />
        </label>
        <label className="field">
          <span>Target Audience</span>
          <input
            value={brief.targetAudience}
            onChange={(event) => handleFieldChange('targetAudience', event.target.value)}
            placeholder="HR leaders, SMB founders..."
            disabled={submitting || disabled}
          />
        </label>
      </div>

      <label className="field">
        <span>Problem Statement</span>
        <textarea
          value={brief.problemStatement}
          onChange={(event) => handleFieldChange('problemStatement', event.target.value)}
          disabled={submitting || disabled}
        />
      </label>

      <label className="field">
        <span>Product Description</span>
        <textarea
          value={brief.productDescription}
          onChange={(event) => handleFieldChange('productDescription', event.target.value)}
          disabled={submitting || disabled}
        />
      </label>

      <div className="grid">
        <label className="field">
          <span>Key Features (comma separated)</span>
          <input
            value={brief.keyFeatures}
            onChange={(event) => handleFieldChange('keyFeatures', event.target.value)}
            placeholder="Recommendation engine, Dashboard, API"
            disabled={submitting || disabled}
          />
        </label>
        <label className="field">
          <span>Budget Range</span>
          <input
            value={brief.budgetRange}
            onChange={(event) => handleFieldChange('budgetRange', event.target.value)}
            placeholder="$50k - $150k"
            disabled={submitting || disabled}
          />
        </label>
      </div>

      <div className="grid">
        <label className="field">
          <span>Timeline Expectation</span>
          <input
            value={brief.timeline}
            onChange={(event) => handleFieldChange('timeline', event.target.value)}
            placeholder="Launch in 3 months"
            disabled={submitting || disabled}
          />
        </label>
        <label className="field">
          <span>Success Metrics</span>
          <input
            value={brief.successMetrics}
            onChange={(event) => handleFieldChange('successMetrics', event.target.value)}
            placeholder="Signups, ARR, retention"
            disabled={submitting || disabled}
          />
        </label>
      </div>

      <label className="field">
        <span>Technical Constraints</span>
        <textarea
          value={brief.technicalConstraints}
          onChange={(event) => handleFieldChange('technicalConstraints', event.target.value)}
          placeholder="Must integrate with Salesforce, use MERN, etc."
          disabled={submitting || disabled}
        />
      </label>

      <button type="submit" disabled={submitting || disabled}>
        {submitting ? 'Creating...' : 'Create Job'}
      </button>
    </form>
  );
};
