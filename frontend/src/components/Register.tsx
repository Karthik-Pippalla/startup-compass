import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Phone, AlertCircle, Check, Briefcase, DollarSign, TrendingUp, Code, X } from 'lucide-react';
import type { RegisterData } from '../types/user';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

const USER_TYPES = [
  { value: 'startup_founder', label: 'Startup Founder', icon: Briefcase, description: 'Building your own company' },
  { value: 'marketer', label: 'Marketer', icon: TrendingUp, description: 'Marketing professional' },
  { value: 'funder', label: 'Funder', icon: DollarSign, description: 'Investing in startups' },
  { value: 'developer', label: 'Developer', icon: Code, description: 'Building products' },
] as const;

const INTEREST_OPTIONS = [
  // AI / ML
  'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Generative AI (LLMs)', 'MLOps', 'Computer Vision', 'Natural Language Processing', 'Speech AI', 'Reinforcement Learning', 'Edge AI',
  // Data & Analytics
  'Data Science', 'Data Engineering', 'Big Data', 'Analytics', 'Real-time Streaming (Kafka/Pulsar)', 'Lakehouse (Delta/Iceberg/Hudi)', 'ETL/ELT', 'Data Visualization', 'Data Governance & Quality',
  // Web / Frontend
  'Web Development', 'React', 'Next.js', 'Vue', 'Svelte', 'SolidJS', 'WebAssembly', 'TypeScript', 'Design Systems', 'Tailwind CSS', 'Jamstack',
  // Mobile
  'iOS', 'Android', 'Flutter', 'React Native',
  // Backend & APIs
  'Node.js', 'Python', 'Go (Golang)', 'Rust', 'Java', 'Kotlin', 'Deno', 'Microservices', 'Serverless', 'GraphQL', 'gRPC', 'Event-Driven Architecture', 'API Design & Security',
  // Cloud & DevOps
  'Cloud Computing', 'AWS', 'Azure', 'Google Cloud', 'Kubernetes', 'Docker', 'Terraform', 'Pulumi', 'CI/CD', 'Observability (Logs/Traces/Metrics)', 'SRE', 'Platform Engineering', 'FinOps',
  // Security
  'Cybersecurity', 'Application Security', 'Cloud Security', 'Zero Trust', 'DevSecOps', 'Identity & Access Management (IAM)', 'Privacy Engineering', 'Threat Detection & Response',
  // Web3 / Blockchain
  'Blockchain', 'Smart Contracts', 'DeFi', 'NFTs', 'Layer 2 (Optimism/Arbitrum/zk)', 'DAOs', 'Web3 Infrastructure',
  // AR/VR, Gaming & 3D
  'AR/VR', 'Spatial Computing', 'Metaverse', '3D Graphics', 'Game Development (Unity/Unreal)',
  // Hardware, IoT & Edge
  'IoT', 'Edge Computing', 'Robotics', 'Drones', 'Wearables', 'Embedded Systems', '5G/6G',
  // Science, Health & Climate
  'BioTech', 'Genomics', 'Digital Health', 'MedTech', 'ClimateTech', 'Clean Energy', 'Carbon Accounting',
  // Productivity & Automation
  'No-code/Low-code', 'Automation & RPA', 'Chatbots', 'Collaboration Tools',
  // Business & Industry
  'SaaS', 'E-commerce', 'FinTech', 'InsurTech', 'PropTech', 'Supply Chain Tech', 'Creator Economy', 'Marketing Tech', 'Sales Tech', 'Product Management', 'Design', 'Development', 'DevOps',
  // Advanced Computing
  'Quantum Computing', 'Cryptography', 'Differential Privacy', 'Homomorphic Encryption'
];

const inputStyle = {
  width: '100%',
  padding: '0.5rem 1rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  fontSize: '1rem',
  boxSizing: 'border-box' as const
};

const inputWithIconStyle = {
  ...inputStyle,
  paddingLeft: '2.5rem'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '500' as const,
  color: '#374151',
  marginBottom: '0.5rem'
};

const buttonPrimaryStyle = {
  padding: '0.5rem 1rem',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontWeight: '500' as const,
  cursor: 'pointer',
  fontSize: '1rem'
};

const buttonSecondaryStyle = {
  padding: '0.5rem 1rem',
  background: 'transparent',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  fontWeight: '500' as const,
  cursor: 'pointer',
  fontSize: '1rem'
};

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState<'startup_founder' | 'marketer' | 'funder' | 'developer' | ''>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleAddInterest = (interest: string) => {
    if (!interests.includes(interest) && interests.length < 10) {
      setInterests([...interests, interest]);
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim()) && interests.length < 10) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!firstName || !lastName || !userType) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (interests.length === 0) {
      setError('Please select at least one interest');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setError('');
    setLoading(true);

    try {
      const registerData: RegisterData & { password: string } = {
        email,
        password,
        firstName,
        lastName,
        userType: userType as 'startup_founder' | 'marketer' | 'funder' | 'developer',
        interests,
        bio: bio || undefined,
        phoneNumber: phoneNumber || undefined,
      };

      await register(registerData);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '1rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      {/* Progress Steps */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < 3 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  background: s <= step ? '#3b82f6' : '#e5e7eb',
                  color: s <= step ? 'white' : '#6b7280',
                  flexShrink: 0
                }}>
                  {s < step ? <Check style={{ width: '1.5rem', height: '1.5rem' }} /> : s}
                </div>
                <span style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {s === 1 && 'Account'}
                  {s === 2 && 'Profile'}
                  {s === 3 && 'Interests'}
                </span>
              </div>
              {s < 3 && (
                <div style={{
                  flex: 1,
                  height: '4px',
                  margin: '0 0.5rem',
                  background: s < step ? '#3b82f6' : '#e5e7eb',
                  borderRadius: '2px'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
          <p style={{ fontSize: '0.875rem', color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Step 1: Account Details */}
      {step === 1 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', margin: 0 }}>Create Account</h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Start your journey with us</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                color: '#9ca3af'
              }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputWithIconStyle}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                color: '#9ca3af'
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputWithIconStyle}
                placeholder="••••••••"
                required
              />
            </div>
            <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
              Must be at least 6 characters
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Confirm Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                color: '#9ca3af'
              }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputWithIconStyle}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            style={{ ...buttonPrimaryStyle, width: '100%' }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Profile Details */}
      {step === 2 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', margin: 0 }}>
              Tell us about yourself
            </h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Help us personalize your experience</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.25rem',
                  height: '1.25rem',
                  color: '#9ca3af'
                }} />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputWithIconStyle}
                  placeholder="John"
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Phone Number (optional)</label>
            <div style={{ position: 'relative' }}>
              <Phone style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                color: '#9ca3af'
              }} />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={inputWithIconStyle}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>I am a *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {USER_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = userType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setUserType(type.value)}
                    style={{
                      padding: '1rem',
                      border: isSelected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      textAlign: 'left',
                      background: isSelected ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        color: isSelected ? '#3b82f6' : '#9ca3af'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#111' }}>{type.label}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{type.description}</div>
                      </div>
                      {isSelected && (
                        <Check style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ ...buttonSecondaryStyle, flex: 1 }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              style={{ ...buttonPrimaryStyle, flex: 1 }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Interests & Final Submit */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', margin: 0 }}>
              What are you interested in?
            </h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              Select up to 10 interests (at least 1 required)
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>
              Selected Interests ({interests.length}/10)
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              minHeight: '2.5rem',
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}>
              {interests.length === 0 ? (
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No interests selected yet</span>
              ) : (
                interests.map((interest) => (
                  <span
                    key={interest}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      background: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '9999px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#1e40af'
                      }}
                    >
                      <X style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Scrollable interests options */}
            <div style={{
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              background: '#ffffff',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {INTEREST_OPTIONS.filter(opt => !interests.includes(opt)).map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleAddInterest(interest)}
                    disabled={interests.length >= 10}
                    style={{
                      padding: '0.25rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      background: 'white',
                      color: '#111827', // ensure visible on white background
                      cursor: interests.length >= 10 ? 'not-allowed' : 'pointer',
                      opacity: interests.length >= 10 ? 0.5 : 1
                    }}
                  >
                    + {interest}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomInterest())}
                placeholder="Add custom interest"
                disabled={interests.length >= 10}
                style={{
                  ...inputStyle,
                  flex: 1,
                  opacity: interests.length >= 10 ? 0.5 : 1
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                disabled={interests.length >= 10 || !customInterest.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: (interests.length >= 10 || !customInterest.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (interests.length >= 10 || !customInterest.trim()) ? 0.5 : 1
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Bio (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{
                ...inputStyle,
                resize: 'vertical' as const,
                minHeight: '100px'
              }}
              maxLength={500}
              placeholder="Tell us a bit about yourself..."
            />
            <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>
              {bio.length}/500 characters
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{ ...buttonSecondaryStyle, flex: 1 }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonPrimaryStyle,
                flex: 1,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', margin: '1.5rem 0 0 0' }}>
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          style={{
            color: '#3b82f6',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Sign in
        </button>
      </p>
    </div>
  );
};
