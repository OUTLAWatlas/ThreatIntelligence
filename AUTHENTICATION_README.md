# Authentication System Setup Guide

## Overview
JWT-based authentication has been successfully added to your Threat Intelligence Dashboard with login and signup functionality.

## What's Been Added

### Backend Components

1. **User Model** (`models/User.js`)
   - Username, email, password fields with validation
   - Password hashing with bcrypt
   - User roles: user, analyst, admin
   - Password comparison method for login

2. **Authentication Controller** (`backend/controllers/authController.js`)
   - `register` - Create new user accounts
   - `login` - Authenticate users and generate JWT tokens
   - `getCurrentUser` - Get current user information
   - `logout` - Logout functionality

3. **Authentication Routes** (`backend/routes/auth.js`)
   - POST `/api/auth/register` - User registration
   - POST `/api/auth/login` - User login
   - POST `/api/auth/logout` - User logout
   - GET `/api/auth/me` - Get current user (protected)

4. **JWT Middleware** (`backend/middleware/authMiddleware.js`)
   - `protect` - Verify JWT tokens and authenticate requests
   - `authorize` - Check user roles for specific routes

### Frontend Components

1. **Login Page** (`frontend/login.html`)
   - Modern, cybersecurity-themed UI matching your existing design
   - Email and password fields
   - Link to signup page
   - Error/success message display

2. **Signup Page** (`frontend/signup.html`)
   - Username, email, password, and confirm password fields
   - Role selection (user, analyst, admin)
   - Terms acceptance checkbox
   - Link back to login page

3. **Authentication JavaScript** (`frontend/js/auth.js`)
   - Token management (localStorage)
   - Login/signup form handling
   - Authentication checks for protected pages
   - User info display
   - Logout functionality
   - `authFetch` helper for authenticated API requests

### Updated Files

- **Server Files**: Both `backend/server.js` and `server-mongo.js` updated with auth routes
- **Main Dashboard**: `frontend/index.html` now shows user info and logout button
- **All Pages**: Authentication check added to actors, indicators, incidents, and feeds pages
- **Environment**: `.env` file updated with JWT_SECRET

## How to Use

### 1. Start the Server

**Option A - JSON Server (Simple):**
```bash
npm start
```

**Option B - MongoDB Server (Full Database):**
```bash
npm run mongo:start
```

The server will run on `http://localhost:3000` or `http://localhost:5000` (depending on server type).

### 2. Access the Application

1. Navigate to `http://localhost:5000` (or your configured port)
2. You'll be redirected to the login page

### 3. Create an Account

1. Click "Sign up" on the login page
2. Fill in the registration form:
   - Username (3-30 characters)
   - Email address
   - Password (minimum 6 characters)
   - Confirm password
   - Select role (user/analyst/admin)
3. Accept terms and click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

### 4. Login

1. Enter your email and password
2. Click "Sign In"
3. Upon successful login, you'll be redirected to the dashboard

### 5. Protected Routes

All dashboard pages are now protected and require authentication:
- Dashboard (`/dashboard`)
- Threat Actors (`/actors`)
- Indicators (`/indicators`)
- Incidents (`/incidents`)
- Threat Feeds (`/feeds`)

### 6. Logout

Click the "Logout" button in the top navigation bar to sign out.

## API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Protected Endpoints

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastLogin": "2025-01-15T12:00:00.000Z"
  }
}
```

## Frontend Integration

### Check Authentication
```javascript
if (window.authUtils.isAuthenticated()) {
  // User is logged in
  const user = window.authUtils.getCurrentUser();
  console.log(user.username);
}
```

### Make Authenticated Requests
```javascript
// Using the authFetch helper (automatically adds token)
window.authUtils.authFetch('/api/actors')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Manual Token Usage
```javascript
const token = window.authUtils.getToken();

fetch('/api/actors', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Logout
```javascript
window.authUtils.handleLogout();
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Tokens**: Secure token-based authentication with 7-day expiration
3. **Protected Routes**: Middleware checks authentication on protected endpoints
4. **Role-Based Access**: Support for different user roles (user, analyst, admin)
5. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
6. **Auto-Redirect**: Unauthenticated users automatically redirected to login page

## Environment Variables

Make sure your `.env` file contains:

```env
JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345
MONGODB_URI=mongodb://localhost:27017/threat_intelligence
PORT=5000
```

**IMPORTANT**: Change the `JWT_SECRET` to a strong, random string in production!

## Production Recommendations

1. **JWT_SECRET**: Generate a strong, random secret key
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **HTTPS**: Always use HTTPS in production

3. **Token Storage**: Consider using httpOnly cookies instead of localStorage

4. **Token Expiration**: Adjust token expiration time based on your security requirements

5. **Rate Limiting**: Add rate limiting to prevent brute force attacks

6. **Email Verification**: Add email verification for new accounts

7. **Password Reset**: Implement password reset functionality

8. **Refresh Tokens**: Implement refresh token mechanism for better security

## Troubleshooting

### Issue: "Not authorized, no token"
- Make sure you're logged in
- Check that the token exists in localStorage
- Verify the Authorization header is being sent

### Issue: "Invalid credentials"
- Verify email and password are correct
- Check MongoDB connection
- Ensure User model is properly registered

### Issue: Page redirects to login immediately
- Check browser console for errors
- Verify token is valid and not expired
- Check network requests for 401 errors

### Issue: MongoDB connection error
- Ensure MongoDB is running
- Verify MONGODB_URI in .env file
- Check MongoDB connection logs

## Testing the Authentication

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","role":"user"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Protected Route
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

1. Start the server and test the authentication flow
2. Create a user account
3. Login and explore the dashboard
4. Consider implementing additional security features for production
5. Add more role-based access controls as needed

## Support

For issues or questions, check:
- Browser console for JavaScript errors
- Server logs for backend errors
- Network tab for API request/response details
