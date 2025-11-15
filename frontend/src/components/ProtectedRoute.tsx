import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthPage } from './AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, userProfile } = useAuth();

  // If not authenticated, show login/register
  if (!user) {
    return <AuthPage />;
  }

  // If authenticated but no profile, show registration completion
  if (!userProfile) {
    return <AuthPage defaultView="register" />;
  }

  // If authenticated and has profile, show the protected content
  return <>{children}</>;
};
