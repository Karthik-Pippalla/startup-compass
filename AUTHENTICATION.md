# Custom Authentication System

This project now uses a custom JWT-based authentication system instead of Firebase Authentication.

## Backend Implementation

### 1. Authentication Middleware (`backend/src/middleware/authMiddleware.js`)

The middleware provides three main functions:

- **`generateToken(userId)`**: Creates a JWT token for authenticated users
- **`verifyToken`**: Middleware that verifies JWT tokens from request headers or cookies
- **`authorize(...userTypes)`**: Middleware that restricts access based on user types

### 2. User Model Updates (`backend/src/models/User.js`)

The User model has been updated with:

- **`password`** field: Required field for storing hashed passwords
- **Password hashing**: Automatically hashes passwords before saving using bcrypt
- **`comparePassword()`** method: Compares plain text passwords with hashed passwords
- **JSON serialization**: Removes password field from JSON responses

### 3. Authentication Controller (`backend/src/controllers/authController.js`)

New endpoints implemented:

#### Public Routes:
- **POST `/api/auth/register`**: Register a new user with email and password
  - Required fields: email, password, firstName, lastName, userType
  - Returns: JWT token and user profile
  
- **POST `/api/auth/login`**: Login with email and password
  - Required fields: email, password
  - Returns: JWT token and user profile

- **POST `/api/auth/logout`**: Logout user (client removes token)

#### Protected Routes (require JWT token):
- **GET `/api/auth/profile`**: Get current user profile
- **PUT `/api/auth/profile`**: Update user profile
- **PUT `/api/auth/change-password`**: Change user password
- **DELETE `/api/auth/account`**: Delete user account

### 4. Required Environment Variables

Add to your `.env` file:

```env
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
```

## Frontend Implementation

### 1. Auth API (`frontend/src/lib/authApi.ts`)

Provides all authentication API calls:

- `authAPI.register()`: Register new user
- `authAPI.login()`: Login user
- `authAPI.logout()`: Logout user
- `authAPI.getProfile()`: Get user profile
- `authAPI.updateProfile()`: Update profile
- `authAPI.changePassword()`: Change password
- `authAPI.deleteAccount()`: Delete account

Token management functions:
- `getToken()`: Retrieve stored token
- `setToken()`: Store token in localStorage
- `removeToken()`: Remove token from localStorage

### 2. Auth Context (`frontend/src/contexts/AuthContext.tsx`)

Updated to use custom authentication:

```typescript
const { 
  user,              // Current user profile
  loading,           // Loading state
  isAuthenticated,   // Authentication status
  signUp,            // Register new user
  signIn,            // Login user
  logout,            // Logout user
  updateUserProfile, // Update profile
  changePassword,    // Change password
  refreshUserProfile // Refresh user data
} = useAuth();
```

### Usage Example:

```typescript
// Sign up
await signUp(email, password, {
  firstName,
  lastName,
  userType: 'startup_founder',
  interests: [],
  bio: ''
});

// Sign in
await signIn(email, password);

// Update profile
await updateUserProfile({
  firstName: 'New Name',
  bio: 'Updated bio'
});

// Change password
await changePassword('currentPassword', 'newPassword');

// Logout
await logout();
```

## Migration Notes

### Changes from Firebase:

1. **No Firebase dependencies**: Firebase SDK has been removed from authentication flow
2. **Password storage**: Users now need to provide passwords during registration
3. **JWT tokens**: Tokens are stored in localStorage and sent via Authorization headers
4. **User ID**: Changed from `uid` to `_id` (MongoDB ObjectId)
5. **Email verification**: Removed Firebase email verification (can be implemented separately)
6. **Social login**: Google authentication removed (can be added back with OAuth2)

### Components to Update:

You may need to update the following components to work with the new auth system:

1. **Register Component**: Add password field to registration form
2. **Login Component**: Update to use email/password instead of Firebase
3. **Protected Routes**: Should work without changes (uses `isAuthenticated`)
4. **User Profile**: Update references from `user.uid` to `user.id`

## Security Best Practices

1. **JWT Secret**: Use a strong, random secret in production
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiry**: Tokens expire after 7 days by default
4. **Password Requirements**: Minimum 6 characters (consider stronger requirements)
5. **Rate Limiting**: Consider adding rate limiting to auth endpoints
6. **CORS**: Configure CORS properly for your frontend domain

## Database Changes

The User model now requires a password field. Existing users from Firebase need to:
1. Be migrated with new passwords, or
2. Reset their passwords using a password reset flow

## Testing

Test the authentication flow:

1. Register a new user
2. Login with credentials
3. Access protected routes with token
4. Update profile
5. Change password
6. Logout

## Dependencies Added

Backend:
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT token generation and verification
- `cookie-parser`: Cookie parsing (optional, for cookie-based auth)

## Next Steps

Consider implementing:
1. Password reset via email
2. Email verification
3. OAuth2 social login (Google, GitHub, etc.)
4. Refresh tokens for better security
5. Two-factor authentication (2FA)
6. Rate limiting for auth endpoints
