import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '450px',
      margin: '0 auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '1rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '4rem',
          height: '4rem',
          background: '#dbeafe',
          borderRadius: '50%',
          marginBottom: '1rem'
        }}>
          <User style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111', margin: 0 }}>
          Welcome Back
        </h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Sign in to your account</p>
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

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Email Address
          </label>
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
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Password
          </label>
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
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            background: loading ? '#93c5fd' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          style={{
            color: '#3b82f6',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Sign up
        </button>
      </p>
    </div>
  );
};
