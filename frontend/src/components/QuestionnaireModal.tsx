import { useState } from 'react';
import type { QuestionnaireQuestion } from '../types/job';

type QuestionnaireModalProps = {
  questions: QuestionnaireQuestion[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onClose: () => void;
};

export const QuestionnaireModal = ({ questions, onSubmit, onClose }: QuestionnaireModalProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!questions.length) {
    return null;
  }

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(answers);
      setAnswers({});
      onClose(); // dismiss after submit
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (question: QuestionnaireQuestion) => {
    const commonProps = {
      value: answers[question.key] ?? '',
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleChange(question.key, event.target.value),
      disabled: submitting,
      placeholder: question.helpText || '',
    };

    if (question.type === 'textarea') {
      return <textarea {...commonProps} className="modal-textarea" />;
    }

    if (question.type === 'number') {
      return <input type="number" {...commonProps} className="modal-input" />;
    }

    if (question.type === 'tags') {
      return <input {...commonProps} className="modal-input" placeholder="Separate with commas" />;
    }

    return <input {...commonProps} className="modal-input" />;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🤔 I need some more details</h2>
          <p>Your idea sounds interesting! To provide you with the most accurate analysis from our specialized agents (Marketing, Development, Funding, and Competitor Analysis), I need a few more details:</p>
          <button 
            className="modal-close" 
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-questions">
            {questions.map((question) => (
              <div key={question.key} className="modal-field">
                <label className="modal-label">
                  <span className="modal-label-text">
                    {question.label}
                  </span>
                  {renderInput({ ...question, /* force optional */ type: question.type })}
                  {question.helpText && (
                    <span className="modal-help-text">{question.helpText}</span>
                  )}
                </label>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="modal-button modal-button-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-button modal-button-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Continue Analysis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
