export interface UserProfile {
  id: string; // Changed from uid to id (MongoDB _id)
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  userType: 'startup_founder' | 'marketer' | 'funder' | 'developer';
  interests: string[];
  bio?: string;
  phoneNumber?: string;
  photoURL?: string;
  isEmailVerified?: boolean;
  metadata?: {
    createdAt: Date;
    lastLogin?: Date;
    profileCompleted: boolean;
  };
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  userType: 'startup_founder' | 'marketer' | 'funder' | 'developer';
  interests?: string[];
  bio?: string;
  phoneNumber?: string;
  photoURL?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  userType?: 'startup_founder' | 'marketer' | 'funder' | 'developer';
  interests?: string[];
  bio?: string;
  phoneNumber?: string;
  photoURL?: string;
}
