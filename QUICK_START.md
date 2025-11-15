# 🚀 Quick Start Guide - Custom Authentication

## ✅ Setup Complete!

Your application now uses custom JWT-based authentication instead of Firebase.

## Backend Setup

### 1. Install Dependencies (Already Done ✓)
```bash
cd backend
npm install bcryptjs jsonwebtoken cookie-parser
```

### 2. Configure Environment Variables

Create or update `backend/.env`:
```env
# Required for JWT authentication
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d

# MongoDB connection
MONGO_URI=mongodb://localhost:27017/startup-compass

# Server config
PORT=4000
NODE_ENV=development
```

⚠️ **Important:** Change `JWT_SECRET` to a strong random string in production!

### 3. Start Backend Server
```bash
cd backend
npm run dev
```

## Frontend Setup

### 1. No Additional Dependencies Needed ✓

All required code is already in place!

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

## Testing Authentication

### Option 1: Run Automated Tests
```bash
cd backend
node testAuth.js
```

This will test:
- ✅ User registration
- ✅ Login
- ✅ Profile retrieval
- ✅ Profile updates
- ✅ Password changes
- ✅ Logout
- ✅ Protected routes

### Option 2: Manual Testing

#### Register a New User:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "startup_founder",
    "interests": ["AI", "tech"],
    "bio": "Test user"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

Save the returned `token` for authenticated requests!

#### Get Profile (Protected):
```bash
curl http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Using in Frontend Components

### Import the Hook:
```typescript
import { useAuth } from './contexts/AuthContext';
```

### Use in Components:
```typescript
function MyComponent() {
  const { 
    user,              // Current user profile
    userProfile,       // Same as user (backward compatibility)
    loading,           // Is authentication loading?
    isAuthenticated,   // Is user logged in?
    signUp,            // Register function
    signIn,            // Login function
    logout,            // Logout function
    updateUserProfile, // Update profile
    registerUser       // Complete registration
  } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  // Use user data
  return (
    <div>
      <h1>Welcome {user?.displayName}</h1>
      <p>Email: {user?.email}</p>
      <p>Type: {user?.userType}</p>
    </div>
  );
}
```

### Example: Login Form
```typescript
const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // User is now logged in!
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Example: Register Form
```typescript
const Register = () => {
  const { signUp, registerUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'startup_founder' as const,
    interests: [] as string[],
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create account with email/password
      await signUp(formData.email, formData.password);
      
      // Then complete profile
      await registerUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: formData.userType,
        interests: formData.interests,
        bio: formData.bio
      });
      
      // User is now registered!
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
};
```

## API Endpoints

### Public Endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Protected Endpoints (require JWT token):
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

## Key Differences from Firebase

| Feature | Firebase | Custom Auth |
|---------|----------|-------------|
| User ID | `uid` (Firebase) | `id` (MongoDB _id) |
| Token Type | Firebase ID Token | JWT Token |
| Token Storage | Firebase SDK | localStorage |
| Password | Not stored | Hashed with bcrypt |
| Email Verification | Built-in | Manual implementation needed |
| Social Login | Built-in | Need to implement OAuth2 |

## Security Notes

1. **JWT Secret:** Use a strong, random secret (min 32 chars)
2. **HTTPS:** Always use HTTPS in production
3. **Token Expiry:** Tokens expire after 7 days (configurable)
4. **Password:** Minimum 6 characters (consider increasing)
5. **Storage:** Tokens in localStorage (consider httpOnly cookies)

## Troubleshooting

### "No token provided" Error
- Make sure you're logged in
- Check if token exists: `localStorage.getItem('auth_token')`

### "Invalid or expired token" Error
- Token may have expired (7 days default)
- Login again to get a new token

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Check MONGO_URI in .env file

### CORS Errors
- Backend CORS is configured for all origins in development
- Update CORS settings for production

## Next Steps

1. ✅ Authentication is working
2. Consider implementing:
   - Password reset via email
   - Email verification
   - OAuth2 social login
   - Refresh tokens
   - Rate limiting
   - 2FA (Two-factor authentication)

## Documentation

- **AUTHENTICATION.md** - Complete authentication documentation
- **MIGRATION_SUMMARY.md** - What changed in the migration
- **TYPESCRIPT_FIXES.md** - TypeScript errors fixed
- **backend/testAuth.js** - Test script

## Support

If you encounter issues:
1. Check console for errors
2. Verify backend is running
3. Check MongoDB connection
4. Verify environment variables
5. Review documentation files

---

🎉 **You're all set!** Your custom authentication system is ready to use!
