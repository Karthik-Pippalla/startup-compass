import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';

interface AuthPageProps {
  onSuccess?: () => void;
  defaultView?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, defaultView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register'>(defaultView);

  const handleSuccess = () => {
    // Let parent (App) re-render using updated AuthContext (no full reload)
    onSuccess?.();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #ea580c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        {view === 'login' ? (
          <Login
            onSwitchToRegister={() => setView('register')}
            onSuccess={handleSuccess}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setView('login')}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};
