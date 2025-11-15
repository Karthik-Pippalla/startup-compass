# 🎉 NO FIREBASE API KEYS NEEDED!

## Important: You Don't Need Firebase Anymore!

We replaced Firebase authentication with **custom JWT-based authentication**. This means:

✅ **No Firebase API keys required**
✅ **No Firebase Console setup needed**
✅ **No external service dependencies**
✅ **Everything runs on your own backend**

---

## What You Need Instead:

### 1. Backend (.env in `/backend` folder):
```env
# Your secret key for JWT tokens (can be any random string)
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# MongoDB connection
MONGO_URI=mongodb://localhost:27017/startup-compass

# Server port
PORT=4000
```

### 2. Frontend (.env in `/frontend` folder):
```env
# Just point to your backend - no API keys needed!
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## How to Start Your App:

### Terminal 1 - Start Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
```

### Terminal 3 - Make sure MongoDB is running:
```bash
# Check if running:
pgrep -f mongod

# If not running, start it:
mongod
# OR
brew services start mongodb-community
```

---

## Servers Should Be Running On:

- **Backend API**: http://localhost:4000
- **Frontend**: http://localhost:5173 (Vite dev server)
- **MongoDB**: localhost:27017

---

## Testing Registration:

1. Open http://localhost:5173 in your browser
2. Click "Sign up" or "Create Account"
3. Fill in the registration form:
   - Email: test@example.com
   - Password: Test123456
   - First Name: John
   - Last Name: Doe
   - User Type: Startup Founder
   - Interests: Select at least one
4. Click "Create Account"

---

## What Happens Behind the Scenes:

1. **Frontend** (Vite at :5173) sends registration data
2. **Backend** (Express at :4000) receives the request
3. Password is **hashed** with bcrypt
4. User is saved to **MongoDB**
5. **JWT token** is generated and sent back
6. Frontend stores token in **localStorage**
7. You're logged in! 🎉

---

## Common Issues:

### "Failed to fetch"
- **Problem**: Backend is not running
- **Solution**: Start backend with `cd backend && npm run dev`

### "Cannot connect to MongoDB"
- **Problem**: MongoDB is not running
- **Solution**: Run `mongod` or `brew services start mongodb-community`

### CORS errors
- **Solution**: Backend already has CORS enabled for localhost

---

## Where Are the "API Keys"?

### OLD (Firebase):
- ❌ Needed Firebase Console
- ❌ Needed Firebase API keys
- ❌ Needed Firebase project setup
- ❌ External dependency

### NEW (Custom Auth):
- ✅ JWT_SECRET in backend .env (you create it!)
- ✅ No external services
- ✅ No API keys from third parties
- ✅ Complete control

---

## Your JWT Secret:

The only "key" you need is **JWT_SECRET** in your backend `.env` file.

**How to generate a good secret:**

```bash
# Option 1: Random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Use a password generator
# Just make it long and random!

# Option 3: Simple but secure
your-app-name-$(date +%s)-random-secret-key-2024
```

Example:
```env
JWT_SECRET=startup-compass-1699876543-super-secret-key-do-not-share
```

---

## Summary:

🔑 **No Firebase API keys needed!**
🎯 **Backend runs on port 4000**
💻 **Frontend runs on port 5173**
🗄️ **MongoDB runs on port 27017**
🔐 **JWT handles authentication**

Just make sure all three services are running and you're good to go! 🚀
