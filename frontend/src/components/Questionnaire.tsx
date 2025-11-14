import { useState } from 'react';
import type { QuestionnaireQuestion } from '../types/job';

type QuestionnaireProps = {
  questions: QuestionnaireQuestion[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  disabled?: boolean;
};

export const Questionnaire = ({ questions, onSubmit, disabled }: QuestionnaireProps) => {
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
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (question: QuestionnaireQuestion) => {
    const commonProps = {
      value: answers[question.key] ?? '',
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleChange(question.key, event.target.value),
      disabled: submitting || disabled,
    };

    if (question.type === 'textarea') {
      return <textarea {...commonProps} />;
    }

    if (question.type === 'number') {
      return <input type="number" {...commonProps} />;
    }

    return <input {...commonProps} />;
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Missing details</h2>
      <p className="muted">Answer these so validation can route to downstream agents.</p>
      {questions.map((question) => (
        <label className="field" key={question.key}>
          <span>
            {question.label}
            {question.helpText ? <small className="muted"> — {question.helpText}</small> : null}
          </span>
          {renderInput(question)}
        </label>
      ))}
      <button type="submit" disabled={submitting || disabled}>
        {submitting ? 'Submitting...' : 'Submit answers'}
      </button>
    </form>
  );
};
