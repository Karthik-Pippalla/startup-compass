import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { UserProfile } from './components/UserProfile';
import { User } from 'lucide-react';

/**
 * Example of how to integrate authentication into your app
 * 
 * This shows:
 * 1. Check if user is authenticated
 * 2. Show login/register if not authenticated
 * 3. Show user profile or main app if authenticated
 */

function AppWithAuth() {
  const { user, userProfile, loading } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user || !userProfile) {
    return <AuthPage />;
  }

  // Show profile page if requested
  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <button
          onClick={() => setShowProfile(false)}
          className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to App
        </button>
        <UserProfile onEdit={() => {/* Implement edit functionality */}} />
      </div>
    );
  }

  // Main app with authenticated user
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Startup Compass</h1>
          
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <User className="w-5 h-5" />
            <span>{userProfile.displayName}</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Welcome, {userProfile.firstName}! 👋</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="font-medium text-blue-900">User Type: {userProfile.userType}</p>
              <p className="text-sm text-blue-700 mt-1">
                You are registered as a {userProfile.userType.replace('_', ' ')}
              </p>
            </div>

            {userProfile.interests.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-md">
                <p className="font-medium text-purple-900 mb-2">Your Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userProfile.bio && (
              <div className="p-4 bg-green-50 rounded-md">
                <p className="font-medium text-green-900 mb-2">About You:</p>
                <p className="text-green-800">{userProfile.bio}</p>
              </div>
            )}
          </div>

          {/* Your existing app components go here */}
          <div className="mt-8 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-600 text-center">
              Your main app components would go here
              <br />
              <br />
              Replace this content with your existing App.tsx content
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppWithAuth;
