# Authentication Migration Summary

## What Changed

✅ **Replaced Firebase Authentication** with custom JWT-based authentication system

### Backend Changes:

1. **New Middleware** (`backend/src/middleware/authMiddleware.js`):
   - JWT token generation and verification
   - Role-based authorization
   - Token extraction from headers or cookies

2. **Updated User Model** (`backend/src/models/User.js`):
   - Added `password` field with bcrypt hashing
   - Removed `uid` requirement (now uses MongoDB `_id`)
   - Auto-hash passwords before saving
   - Password comparison method
   - Secure JSON serialization (excludes password)

3. **New Auth Controller** (`backend/src/controllers/authController.js`):
   - `POST /api/auth/register` - Register with email/password
   - `POST /api/auth/login` - Login with email/password
   - `POST /api/auth/logout` - Logout user
   - `GET /api/auth/profile` - Get user profile
   - `PUT /api/auth/profile` - Update profile
   - `PUT /api/auth/change-password` - Change password
   - `DELETE /api/auth/account` - Delete account

4. **Dependencies Added**:
   - `bcryptjs` - Password hashing
   - `jsonwebtoken` - JWT tokens
   - `cookie-parser` - Cookie support

### Frontend Changes:

1. **New Auth API** (`frontend/src/lib/authApi.ts`):
   - Complete auth API client
   - Token management (localStorage)
   - Automatic token injection in requests

2. **Updated Auth Context** (`frontend/src/contexts/AuthContext.tsx`):
   - Removed Firebase dependencies
   - Custom authentication flow
   - Simplified auth state management

### Configuration:

- **Backend** requires `JWT_SECRET` environment variable
- See `backend/.env.example` for configuration template
- Old Firebase config is backed up

## How to Use

### Backend Setup:

```bash
cd backend
npm install
```

Create `.env` file:
```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
MONGO_URI=mongodb://localhost:27017/startup-compass
```

### Frontend Integration:

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { signUp, signIn, logout, user, isAuthenticated } = useAuth();
  
  // Register
  await signUp(email, password, {
    firstName, lastName, userType, interests, bio
  });
  
  // Login
  await signIn(email, password);
  
  // Logout
  await logout();
}
```

## Testing the Changes

1. Start the backend server
2. Register a new user with email/password
3. Login with credentials
4. Access protected routes
5. Update profile
6. Change password
7. Logout

## Next Steps (Optional Enhancements)

- [ ] Email verification flow
- [ ] Password reset via email
- [ ] OAuth2 social login
- [ ] Refresh token implementation
- [ ] Rate limiting on auth endpoints
- [ ] Two-factor authentication (2FA)

## Documentation

See `AUTHENTICATION.md` for complete documentation.

## Migration Notes

- Existing Firebase users need to re-register with new passwords
- User ID changed from `uid` to `_id`
- Tokens stored in localStorage (consider httpOnly cookies for better security)
- All Firebase auth imports removed from frontend
