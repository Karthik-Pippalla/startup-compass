import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Briefcase, Tag, LogOut, Edit } from 'lucide-react';

interface UserProfileProps {
  onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onEdit }) => {
  const { userProfile, logout } = useAuth();

  if (!userProfile) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const userTypeLabels = {
    startup_founder: 'Startup Founder',
    marketer: 'Marketer',
    funder: 'Funder',
    developer: 'Developer',
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{userProfile.displayName}</h3>
            <p className="text-gray-600">{userTypeLabels[userProfile.userType]}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Contact Information</h4>
          
          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="w-5 h-5 text-gray-400" />
            <span>{userProfile.email}</span>
            {userProfile.isEmailVerified && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Verified
              </span>
            )}
          </div>

          {userProfile.phoneNumber && (
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>{userProfile.phoneNumber}</span>
            </div>
          )}
        </div>

        {/* User Type */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Role</h4>
          <div className="flex items-center gap-3 text-gray-700">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <span>{userTypeLabels[userProfile.userType]}</span>
          </div>
        </div>

        {/* Bio */}
        {userProfile.bio && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Bio</h4>
            <p className="text-gray-700">{userProfile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {userProfile.interests && userProfile.interests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-400" />
              Interests
            </h4>
            <div className="flex flex-wrap gap-2">
              {userProfile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Profile Completion */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Profile Completion</span>
            <span className={`font-medium ${userProfile.metadata?.profileCompleted ? 'text-green-600' : 'text-orange-600'}`}>
              {userProfile.metadata?.profileCompleted ? 'Complete' : 'Incomplete'}
            </span>
          </div>
          {!userProfile.metadata?.profileCompleted && (
            <p className="mt-2 text-sm text-gray-500">
              Add interests and bio to complete your profile
            </p>
          )}
        </div>

        {/* Account Info */}
        <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
          {userProfile.metadata?.createdAt && (
            <p>Member since {new Date(userProfile.metadata.createdAt).toLocaleDateString()}</p>
          )}
          {userProfile.metadata?.lastLogin && (
            <p>Last login: {new Date(userProfile.metadata.lastLogin).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};
